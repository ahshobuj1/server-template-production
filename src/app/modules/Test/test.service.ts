import prisma from '../../utils/prisma';
import { TTest } from './test.interface';

const createTest = async (payload: TTest) => {
  const result = await prisma.test.create({
    data: payload,
  });
  return result;
};

const Test = async () => {
  const result = await prisma.test.findMany();

  if (!result || result.length === 0) {
    return { message: 'No data found' };
  }
  return result;
};

export const testService = {
  createTest,
  Test,
};
