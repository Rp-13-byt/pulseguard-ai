import { Response } from 'express';

export interface SSEMessage {
  type: 'EVENT' | 'RISK_UPDATE' | 'TRANSITION' | 'INTERVENTION' | 'AUDIT' | 'METRICS' | 'SCENARIO_STEP';
  data: unknown;
  timestamp: string;
}

class SSEEventBus {
  private clients: Set<Response> = new Set();

  public addClient(res: Response): void {
    this.clients.add(res);
    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  public broadcast(type: SSEMessage['type'], data: unknown): void {
    const message: SSEMessage = {
      type,
      data,
      timestamp: new Date().toISOString(),
    };
    const payload = `data: ${JSON.stringify(message)}\n\n`;

    for (const client of this.clients) {
      try {
        client.write(payload);
      } catch (err) {
        this.clients.delete(client);
      }
    }
  }

  public getConnectedCount(): number {
    return this.clients.size;
  }
}

export const sseBus = new SSEEventBus();
