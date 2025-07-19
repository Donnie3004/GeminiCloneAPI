import express from 'express';
import webhookController from './webhook.controller.js';
const router = express.Router();


const WebhookController = new webhookController();
router.post('/stripe', WebhookController.handleWebhook);

export default router;