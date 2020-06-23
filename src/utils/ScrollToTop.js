import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default () => {
  const { pathname } = useLocation();
  useEffect((arg) => {
    window.scrollTo(0, 0);
  }, [pathname])
  return null;
}
