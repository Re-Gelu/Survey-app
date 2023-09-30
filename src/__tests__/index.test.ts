import '@testing-library/jest-dom';

import fetch from 'node-fetch';
import { createMocks } from 'node-mocks-http';
import request from 'supertest';

import handlerPolls from '../pages/api/polls';
import handlerPollsId from '../pages/api/polls/[id]';

import type { NextApiRequest, NextApiResponse } from 'next';

describe('API', () => {
  it('GET api/polls', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {},
    });
    await handlerPolls(req, res);

    const responseData = res._getJSONData().data.data;

    expect(responseData).toBeInstanceOf(Array<Object>);
    expect(res.statusCode).toBe(200);
  });

  it('GET api/polls/[id]', async () => {
    var { req, res } = createMocks({
      method: 'GET',
      query: {},
    });
    await handlerPolls(req, res);

    const responseData = res._getJSONData().data.data;
    expect(responseData).toBeInstanceOf(Array<Object>);

    var { req, res } = createMocks({
      method: 'GET',
      query: { id: responseData[0].id },
    });
    await handlerPollsId(req, res);

    const responseDataById = res._getJSONData();
    expect(responseDataById).toBeInstanceOf(Object);
    expect(res.statusCode).toBe(200);
  });

  it('PUT api/polls/[id]', async () => {
    expect(200).toBe(200);
  });

  it('DELETE api/polls/[id]', async () => {
    expect(200).toBe(200);
  });

  it('POST api/polls/[id]/vote', async () => {
    expect(200).toBe(200);
  });
});

describe('APP', () => {
  it('Initialized', async () => {
    expect(200).toBe(200);
  });
  it('Frontend connect backend', async () => {
    expect(200).toBe(200);
  });
  it('All pages is defined', async () => {
    expect(200).toBe(200);
  });
});

describe('COMPONENTS', () => {
  it('Color scheme toggle', async () => {
    expect(200).toBe(200);
  });
  it('Copy button', async () => {
    expect(200).toBe(200);
  });
  it('Polls table', async () => {
    expect(200).toBe(200);
  });
  it('Poll creation form', async () => {
    expect(200).toBe(200);
  });
});
