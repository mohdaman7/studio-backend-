import { Response } from 'express';
import { logger } from './logger';

interface SSEClient {
  id: string;
  userId: string;
  companyId: string;
  res: Response;
}

class SSEManager {
  private clients: Map<string, SSEClient> = new Map();
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startHeartbeat();
  }

  private startHeartbeat() {
    // Send comment ping every 25s to keep connections alive on Render / proxies
    this.heartbeatTimer = setInterval(() => {
      this.clients.forEach((client, id) => {
        try {
          client.res.write(': heartbeat\n\n');
        } catch (err) {
          logger.warn(`Failed to send heartbeat to SSE client ${id}, removing`);
          this.removeClient(id);
        }
      });
    }, 25000);
  }

  public registerClient(companyId: string, userId: string, res: Response): string {
    const id = `${companyId}_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    // Configure SSE Response Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering for Nginx/Render
    res.flushHeaders?.();

    // Send connected greeting
    res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to Studio99 Real-time Stream', clientId: id })}\n\n`);

    const client: SSEClient = { id, userId, companyId, res };
    this.clients.set(id, client);
    logger.info(`[SSE] Client connected: ${id}. Total active: ${this.clients.size}`);

    res.on('close', () => {
      this.removeClient(id);
    });

    return id;
  }

  public removeClient(id: string) {
    if (this.clients.has(id)) {
      this.clients.delete(id);
      logger.info(`[SSE] Client disconnected: ${id}. Remaining: ${this.clients.size}`);
    }
  }

  public broadcastCompanyEvent(companyId: string, event: string, payload: any) {
    let sentCount = 0;
    const dataString = JSON.stringify(payload);

    this.clients.forEach((client, id) => {
      if (client.companyId === companyId) {
        try {
          client.res.write(`event: ${event}\ndata: ${dataString}\n\n`);
          sentCount++;
        } catch (err) {
          logger.error(`[SSE] Error sending event to ${id}:`, err);
          this.removeClient(id);
        }
      }
    });

    logger.info(`[SSE] Broadcasted '${event}' to ${sentCount} clients in company ${companyId}`);
  }
}

export const sseManager = new SSEManager();
