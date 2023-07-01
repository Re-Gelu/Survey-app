import { useEffect, useState } from "react";
import { getCookie } from 'cookies-next';

export const useUserIp = () => {
  const [ip, setUserIp] = useState<string | null | true>("");
  
  
  useEffect(() => {
    const userIp = getCookie("user-ip");
    console.log(getCookie("user-ip"));
    
    if (userIp) {setUserIp(userIp)}
  }, []);

  return ip;
};