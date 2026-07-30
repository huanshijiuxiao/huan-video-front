import "axios";

declare module "axios" {
  interface AxiosResponse<T = unknown> {
    code?: number;
    msg?: string;
    message?: string;
    extra?: T;
  }
}
