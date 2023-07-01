import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import Head from 'next/head';
import { getCookie, CookieValueTypes } from 'cookies-next';
import requestIp from 'request-ip';

const DashboardPage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <>
      <Head>
        <title>Survey App - Dashboard</title>
      </Head>
    </>
  )
};


export const getServerSideProps: GetServerSideProps<PageDataWithIp> = async ({ req, res }) => {
  const reqIp = requestIp.getClientIp(req);
  const userIp = reqIp ? reqIp : getCookie("user-ip", { req, res });

  return {
    props: {
      ip: userIp
    }
  };
};

export default DashboardPage;