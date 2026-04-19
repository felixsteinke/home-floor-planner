import { projectFiles } from 'archunit';
import { describe, expect, it } from 'vitest';

const archunitOptions = {
  // Layer folders may start empty; keep checks active without failing empty selections.
  allowEmptyTests: true,
};

describe('Architecture boundaries', () => {
  it('src/app should be free of circular dependencies', async () => {
    const rule = projectFiles().inFolder('src/app/**').should().haveNoCycles();

    await expect(rule).toPassAsync(archunitOptions);
  }, 20000);

  it('domain layer should not depend on service layer', async () => {
    const rule = projectFiles()
      .inFolder('src/app/domain/**')
      .shouldNot()
      .dependOnFiles()
      .inFolder('src/app/service/**');

    await expect(rule).toPassAsync(archunitOptions);
  });

  it('domain layer should not depend on representation layer', async () => {
    const rule = projectFiles()
      .inFolder('src/app/domain/**')
      .shouldNot()
      .dependOnFiles()
      .inFolder('src/app/representation/**');

    await expect(rule).toPassAsync(archunitOptions);
  });

  it('service layer should not depend on representation layer', async () => {
    const rule = projectFiles()
      .inFolder('src/app/service/**')
      .shouldNot()
      .dependOnFiles()
      .inFolder('src/app/representation/**');

    await expect(rule).toPassAsync(archunitOptions);
  });

  it('domain layer should be free of circular dependencies', async () => {
    const rule = projectFiles().inFolder('src/app/domain/**').should().haveNoCycles();

    await expect(rule).toPassAsync(archunitOptions);
  });

  it('service layer should be free of circular dependencies', async () => {
    const rule = projectFiles().inFolder('src/app/service/**').should().haveNoCycles();

    await expect(rule).toPassAsync(archunitOptions);
  });

  it('representation layer should be free of circular dependencies', async () => {
    const rule = projectFiles().inFolder('src/app/representation/**').should().haveNoCycles();

    await expect(rule).toPassAsync(archunitOptions);
  });
});
