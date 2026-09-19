import { getAllParties, getPartySummaryStats } from '../server/services/partyService.js';

async function test() {
  try {
    console.log('Testing getPartySummaryStats...');
    const stats = await getPartySummaryStats();
    console.log('Stats:', stats);

    console.log('Testing getAllParties...');
    const parties = await getAllParties();
    console.log('Parties count:', parties.length);
  } catch (err) {
    console.error('CATCHED ERROR:', err);
  }
}

test();
