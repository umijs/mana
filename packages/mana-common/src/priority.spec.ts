import assert from 'assert';
import { Priority } from './';

describe('Priority', () => {
  it('#priority sort', () => {
    const items = [
      { id: 'Priority.DEFAULT', value: Priority.DEFAULT },
      { id: 'Priority.IDLE', value: Priority.IDLE },
      { id: 'Priority.PRIOR', value: Priority.PRIOR },
    ];
    const sorted = Priority.sort(items, item => item.value);
    assert(sorted[0].priority === Priority.PRIOR);
    assert(sorted[sorted.length - 1].priority === Priority.DEFAULT);
    assert(sorted.length === 2);
  });
});
