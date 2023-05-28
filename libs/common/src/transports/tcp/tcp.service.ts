import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TcpOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class TcpService {
  constructor(private readonly configService: ConfigService) {}

  getOptions(name: string): TcpOptions {
    /** 
     * To avoid conflict of port number, 
     * Microservice TCP port is set to be based on the HTTP Request Port plus 30000
     * 
     * (i.e. HTTP Request Port is 3000, then Microservice TCP Port will be 33000)
     * 
     */
    
    const httpPort: number = parseInt(this.configService.get<string>(`${name}_PORT`));
    const tcpPort: number = httpPort + 30000;

    return {
      transport: Transport.TCP,
      options: {
        host: this.configService.get<string>(`${name}_HOST`) || '127.0.0.1',
        port: tcpPort,
      },
    };
  }
}