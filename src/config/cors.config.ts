

const allowedOrigins = [
  "http://localhost:3000",
  "https://your-production-domain.com",
];

export const corsOptions = {
  origin: allowedOrigins,
  methods: ["POST"],
  credentials: true,
  optionsSuccessStatus: 204,
};

