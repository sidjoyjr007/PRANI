import cronstrue from 'cronstrue';

/**
 * Converts a cron expression to a human-readable string.
 * Supports standard 5-part cron and 6-part cron (with seconds).
 */
export const getHumanReadableCron = (cron) => {
  if (!cron) return 'No schedule set';
  
  try {
    // cronstrue handles 5 and 6 part crons well
    return cronstrue.toString(cron, { 
      use24HourTimeFormat: true,
      verbose: false
    });
  } catch (err) {
    console.error('Invalid cron expression:', cron, err);
    return 'Invalid schedule';
  }
};
