import { loadContent } from '../contentLoader';

test('loadContent does not throw with minimal content', async () => {
  await expect(loadContent()).resolves.not.toThrow();
});
