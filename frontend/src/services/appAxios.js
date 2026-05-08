import axios from "axios";
import { loaderStore } from "../utils/loaderStore";
import { logout } from "../utils/auth";

// Shared axios instance for every service call in the app. Centralizes:
//
//   1. Global loader — request interceptor bumps an in-flight counter; the
//      response interceptor (success AND error) bumps it back down. The
//      <GlobalLoader /> subscribes to that counter and shows the page-turn
//      animation while requests are in flight.
//
//   2. 401 → logout — any unauthorized response means the session is no
//      longer valid (token expired, signature mismatch, …) so we hard-logout
//      to clear all in-memory state.
//
// Opting out of the loader for a specific call:
//   appAxios.get(url, { skipLoader: true })
// Useful for background polls (e.g. cart count refresh) that shouldn't paint
// the global loader on the screen.

const appAxios = axios.create();

appAxios.interceptors.request.use((config) => {
  if (!config?.skipLoader) {
    config.__loaderTracked = true;
    loaderStore.inc();
  }
  return config;
});

const release = (config) => {
  if (config?.__loaderTracked) {
    config.__loaderTracked = false;
    loaderStore.dec();
  }
};

appAxios.interceptors.response.use(
  (response) => {
    release(response.config);
    return response;
  },
  (error) => {
    release(error?.config);
    if (error?.response?.status === 401) {
      logout("expired");
    }
    return Promise.reject(error);
  }
);

export default appAxios;
