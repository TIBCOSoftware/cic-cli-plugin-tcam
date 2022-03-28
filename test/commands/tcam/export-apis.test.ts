import {expect, test} from '@oclif/test'

describe('tcam:export-apis', () => {
  test
  .stdout()
  .command(['tcam:export-apis'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['tcam:export-apis', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
