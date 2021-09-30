import { Module, Contribution } from 'mana-syringe';
import { ApplicationContribution, Application } from './application';

export const CoreModule = Module(register => {
  register(Application);
  Contribution.register(register, ApplicationContribution);
});
