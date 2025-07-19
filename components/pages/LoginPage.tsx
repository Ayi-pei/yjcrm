import React, { useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { APP_NAME, ICONS } from "../../constants";
import Button from "../ui/Button";
import { designSystem } from "../../styles/design-system";

const LoginPage: React.FC = () => {
  const [keyValue, setKeyValue] = useState("");
  const { login, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyValue.trim()) return;
    try {
      await login(keyValue);
    } catch (err) {
      // 错误处理已在 store 中完成
    }
  };

  return (
    <div className={`min-h-screen ${designSystem.gradients.chat} flex flex-col justify-center items-center`}>
      <div className={`w-full max-w-md p-8 space-y-8 bg-white/80 backdrop-blur-lg ${designSystem.shadows.xl} ${designSystem.borderRadius.xl} border border-white/20`}>
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{APP_NAME}</h1>
          <p className="mt-2 text-slate-600">客服支持中心登录</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="key-value" className="sr-only">
                访问密钥
              </label>
              <input
                id="key-value"
                name="key"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                placeholder="输入您的访问密钥"
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              leftIcon={ICONS.keys}
            >
              {isLoading ? "登录中..." : "登录"}
            </Button>
          </div>
        </form>
      </div>
      <footer className="mt-8 text-center text-sm text-slate-500">
        <p>没有密钥？请联系您的管理员</p>
        <p className="mt-1">需要聊天？请使用客服提供的直接链接</p>
      </footer>
    </div>
  );
};

export default LoginPage;
