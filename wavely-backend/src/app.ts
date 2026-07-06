import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';

const app: Application = express();

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const feedLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // ~5 req/sec per IP — generous for real browsing, still caps abuse
  message: { success: false, message: 'Too many requests, slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers
app.use(helmet());

// Prevent NoSQL injection (strips $ and . from req.body/params/query)
app.use(mongoSanitize());

// parsers
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['http://localhost:3000'],
    credentials: true,
  }),
);

// routes
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1', feedLimiter);
app.use('/api/v1', router);

app.get('/', (_req: Request, res: Response) => {
  res.send('Wavely API is running');
});

app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;
