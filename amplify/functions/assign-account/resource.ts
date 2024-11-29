// amplify/functions/assign-account/resource.ts
import { defineFunction } from '@aws-amplify/backend';

export const assignAccount = defineFunction({
  name: 'assign-account',
  entry: './handler.ts'
});