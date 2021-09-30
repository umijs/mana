/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-parameter-properties */
/* eslint-disable @typescript-eslint/no-redeclare */
import { singleton, contrib, postConstruct, Contribution, Syringe } from 'mana-syringe';

export const ApplicationContribution = Syringe.defineToken('ApplicationContribution');
export interface ApplicationContribution {
  onStart: (app: Application) => Promise<void>;
}

@singleton()
export class Application {
  constructor(
    @contrib(ApplicationContribution)
    protected readonly contributions: Contribution.Provider<ApplicationContribution>,
  ) {}

  @postConstruct()
  protected async startApps(): Promise<void> {
    for (const contribution of this.contributions.getContributions()) {
      if (contribution.onStart) {
        try {
          await contribution.onStart(this);
        } catch (error) {
          console.log('应用启动失败:', contribution.constructor.name);
        }
      }
    }
  }
  printInfo(): void {
    console.log('当前应用共：', this.contributions.getContributions.length);
  }
}
