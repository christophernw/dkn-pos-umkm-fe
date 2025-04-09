/* eslint-disable @typescript-eslint/no-require-imports */
describe("config", () => {
    const originalNodeEnv = process.env.NODE_ENV;
  
    afterEach(() => {
      Object.defineProperty(process.env, "NODE_ENV", {
        value: originalNodeEnv,
        configurable: true,
      });
      jest.resetModules();
    });
  
    it('should export development config when NODE_ENV is undefined', () => {
      Object.defineProperty(process.env, "NODE_ENV", {
        value: undefined,
        configurable: true,
      });
      jest.resetModules();
      const config = require("@/src/config").default;
      expect(config.apiUrl).toBe("backend-api");
      expect(config.hostname).toBe("http://localhost:3000/");
    });
  
    it('should export development config when NODE_ENV is "development"', () => {
      jest.resetModules();
      const config = require("@/src/config").default;
      expect(config.apiUrl).toBe("backend-api");
      expect(config.hostname).toBe("http://localhost:3000/");
    });
  
    it('should export production config when NODE_ENV is "production"', () => {
      process.env = {
        NODE_ENV: "production",
      };
      console.log("this is env: ", process.env.NODE_ENV)
      jest.resetModules();
      const config = require("@/src/config").default;
      expect(config.apiUrl).toBe("/backend-api");
      expect(config.hostname).toBe("https://dkn-pos-umkm-fe.vercel.app/");
    });
  
    it('should export staging config when NODE_ENV is "staging"', () => {
      process.env = {
        NODE_ENV: "staging",
      };
      jest.resetModules();
      const config = require("@/src/config").default;
      expect(config.apiUrl).toBe("/backend-api");
      expect(config.hostname).toBe("https://dkn-pos-umkm-fe-staging.vercel.app/");
    });
  
    it('should export test config when NODE_ENV is "test"', () => {
      process.env = {
        NODE_ENV: "test",
      };
      jest.resetModules();
      const config = require("@/src/config").default;
      expect(config.apiUrl).toBe("backend-api");
      expect(config.hostname).toBe("http://localhost:3000/");
    });
  });