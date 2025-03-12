type Config = {
    development: {
      hostname: string;
      apiUrl: string;
    };
    production: {
      hostname: string;
      apiUrl: string;
    };
    staging: {
      hostname: string;
      apiUrl: string;
    };
    test: {
      hostname: string;
      apiUrl: string;
    };
};
  
const config: Config = {
  development: {
    apiUrl: "http://localhost:8000/api",
    hostname: "http://localhost:3000/",
  },
  production: {
    apiUrl: "backend-api",
    hostname: "https://dkn-pos-umkm-fe.vercel.app/",
  },
  staging: {
    apiUrl: "backend-api",
    hostname: "https://dkn-pos-umkm-fe-staging.vercel.app/",
  },
  test: {
    apiUrl: "backend-api",
    hostname: "http://localhost:3000/",
  },
};
  
  
export default config[process.env.NODE_ENV || "development"];
  