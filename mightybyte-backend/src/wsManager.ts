import WebSocket from 'ws';

interface Client {
  clientId: string;
  ws: WebSocket;
}

const clients: Record<string, Client> = {};

export function registerClient(clientId: string, ws: WebSocket) {
  clients[clientId] = { clientId, ws };
}

export function sendWithAck(clientId: string, message: any) {
  const client = clients[clientId];
  if (!client) {
    console.log(`Client ${clientId} not connected`);
    return;
  }

  const msgString = JSON.stringify(message);
  let attempts = 0;
  const maxAttempts = 3;

  const send = () => {
    if (attempts >= maxAttempts) {
      console.log(`Failed to deliver to ${clientId}`);
      return;
    }
    attempts++;
    client.ws.send(msgString, (err) => {
      if (err) {
        console.log('Send error, retrying...');
        setTimeout(send, 1000);
      }
    });
  };

  send();
}
