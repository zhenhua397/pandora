import {componentName, componentConfig} from 'pandora-component-decorator';
import {EndPointManager} from './EndPointManager';
import {ActuatorRestServer} from './ActuatorRestServer';
import {consoleLogger} from 'pandora-dollar';

@componentName('actuatorServer')
@componentConfig({
  actuatorServer: {
    http: {
      enabled: true,
      host: '127.0.0.1',
      port: 7002
    }
  }
})
export default class ComponentActuatorServer {
  ctx: any;
  endPointManager: EndPointManager;
  actuatorRestServer: ActuatorRestServer;
  constructor(ctx) {
    this.ctx = ctx;
    this.actuatorRestServer = new ActuatorRestServer(ctx);
    ctx.endPointManager = new EndPointManager(this.actuatorRestServer);
  }
  async startAtSupervisor() {
    await this.actuatorRestServer.start();
    if(this.actuatorRestServer.server) {
      const {address, port} = this.actuatorRestServer.server.address();
      consoleLogger.info(`Actuator restful server started at http://${address}:${port}`);
    }
  }
  async stopAtSupervisor() {
    await this.actuatorRestServer.stop();
  }
}

export * from './domain';
export * from './ActuatorRestServer';
export * from './EndPointManager';
