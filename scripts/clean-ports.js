const killPort = require('kill-port');

const PORTS = [3002, 4001];

async function cleanPorts() {
  console.log('🔍 Checking and cleaning ports:', PORTS.join(', '));
  
  for (const port of PORTS) {
    try {
      await killPort(port, 'tcp');
      console.log(`✅ Successfully cleared port ${port}.`);
    } catch (err) {
      // kill-port throws if no process is running on the port, which is fine
      console.log(`✅ Port ${port} is already free.`);
    }
  }

  console.log('✨ Port cleanup complete.\n');
}

cleanPorts().catch(console.error);
