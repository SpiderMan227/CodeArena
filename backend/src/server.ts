import app from './app';
import dotenv from 'dotenv';
import { AIService } from './services/ai.service';

dotenv.config();

// Verify AI Service configurations on startup
AIService.initialize();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[server]: CodeArena API Gateway running on port ${PORT}`);
});
