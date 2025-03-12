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
      // Override NODE_ENV as undefined using defineProperty.
      Object.defineProperty(process.env, "NODE_ENV", {
        value: undefined,
        configurable: true,
      });
      jest.resetModules();
      const config = require("@/src/config").default;
      expect(config.apiUrl).toBe("http://localhost:8000");
      expect(config.hostname).toBe("http://localhost:3000/");
    });
  
    it('should export development config when NODE_ENV is "development"', () => {
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "development",
        configurable: true,
      });
      jest.resetModules();
      const config = require("@/src/config").default;
      expect(config.apiUrl).toBe("http://localhost:8000");
      expect(config.hostname).toBe("http://localhost:3000/");
    });
  
    it('should export production config when NODE_ENV is "production"', () => {
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "production",
        configurable: true,
      });
      jest.resetModules();
      const config = require("@/src/config").default;
      expect(config.apiUrl).toBe("http://103.177.95.190:8000");
      expect(config.hostname).toBe("https://dkn-pos-umkm-fe.vercel.app/");
    });
  
    it('should export staging config when NODE_ENV is "staging"', () => {
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "staging",
        configurable: true,
      });
      jest.resetModules();
      const config = require("@/src/config").default;
      expect(config.apiUrl).toBe("http://103.177.95.190:8000");
      expect(config.hostname).toBe("https://dkn-pos-umkm-fe-staging.vercel.app/");
    });
  
    it('should export test config when NODE_ENV is "test"', () => {
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "test",
        configurable: true,
      });
      jest.resetModules();
      const config = require("@/src/config").default;
      expect(config.apiUrl).toBe("http://103.177.95.190:8000");
      expect(config.hostname).toBe("http://localhost:3000/");
    });
  });