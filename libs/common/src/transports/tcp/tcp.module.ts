import { Logger, DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';

import { IModuleOptions } from '@app/common/interfaces';
import { TcpService } from './tcp.service';

@Module({
  imports: [ConfigModule],
  providers: [TcpService],
  exports: [TcpService],
})

export class TcpModule {
  static register(options: IModuleOptions | IModuleOptions[]): DynamicModule {
    const modules = Array.isArray(options) ? options : [options];

    const clients = modules.map(({ name }) => ({
      name,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const tcpService = new TcpService(configService);
        const tcpOptions = tcpService.getOptions(name);
        
        Logger.log(`[ - TcpModule - ] 📝 Registering microservice for ${name} at tcp://${tcpOptions.options.host}:${tcpOptions.options.port}`);

        return {
          transport: tcpOptions.transport,
          options: tcpOptions.options,
        };
      },
    }));

    return {
      module: TcpModule,
      imports: [ClientsModule.registerAsync(clients)],
      exports: [ClientsModule],
    };
  }
}