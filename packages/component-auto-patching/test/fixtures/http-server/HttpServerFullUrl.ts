import { Fixture, sleep, extractLog } from '../../TestUtil';
import { HttpServerPatcher } from '../../../src/patchers';
import * as sinon from 'sinon';
import * as assert from 'assert';
import { SPAN_FINISHED } from 'pandora-component-trace';

export default class HttpServerFixture extends Fixture {

  config() {

    return {
      patchers: {
        httpServer: {
          enabled: true,
          klass: HttpServerPatcher,
          recordFullUrl: true
        }
      }
    };
  }

  async case(done) {
    const http = require('http');
    const urllib = require('urllib');

    const stub = sinon.stub(this.componentTrace.traceManager, 'record').callsFake(function(span, isEntry) {
      assert(span);
      assert(isEntry);

      span.on(SPAN_FINISHED, (s) => {
        assert(s.duration >= 100);
        const log = extractLog(s.logs, 'fullUrl');
        assert(log);
        done();
      });
    });

    const server = http.createServer(function(req, res) {
      setTimeout(() => {
        res.end('OK');
      },  Math.floor(1 + Math.random() * 10) * 100);
    });

    server.listen(0);

    sleep(1000);

    const port = server.address().port;
    await urllib.request(`http://localhost:${port}`);

    stub.restore();
  }
}