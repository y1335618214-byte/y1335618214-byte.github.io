import { useRegisterSW } from "virtual:pwa-register/react";
export function usePwa() {
  return useRegisterSW({
    onRegisterError(error) {
      console.error("离线缓存注册失败", error);
    },
  });
}
