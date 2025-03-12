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
    hostname: "http://localhost:3000",
    apiUrl: "http://localhost:8000",
  },
  production: {
    apiUrl: "http://103.177.95.190:8000",
    hostname: "https://dkn-pos-umkm-fe.vercel.app/",
  },
  staging: {
    apiUrl: "http://103.177.95.190:8000",
    hostname: "https://dkn-pos-umkm-fe-staging.vercel.app/",
  },
  test: {
    apiUrl: "http://103.177.95.190:8000",
    hostname: "http://localhost:3000",
  },
};
  
  
export default config[process.env.NODE_ENV || "development"];
  