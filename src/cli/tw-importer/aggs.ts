// Nodes that are still active (not yet completed).
export const active = {
  filter: {
    bool: {
      must_not: [
        { exists: { field: 'completed_date' } },
        { term: { 'status': 2 } },
      ],
    },
  },
  aggs: {
    stats: {
      date_range: {
        field: 'due_date',
        format: 'yyyy-MM-dd HH:mm',
        ranges: [
          { from: 'now', to: 'now+3M', key: 'active' },
          { from: 'now', to: 'now+2d/d', key: 'upcoming' },
          { to: 'now', key: 'overdue' },
        ],
        keyed: true,
      },
    },
  },
}

export const notYetCompleted = {
  must_not: [
    { exists: { field: 'completed_date' } },
    { term: { status: 2 } },
  ],
}

export const activeOnly = Object.assign({ },
  notYetCompleted,
  {
    must: {
      range: {
        due_date: {
          gte: 'now',
          lt:  'now+3M',
        },
      },
    },
  }
)

export const overdueOnly = Object.assign({ },
  notYetCompleted,
  {
    must: {
      range: {
        due_date: {
          lt:  'now',
        },
      },
    },
  }
)

// Nodes completed on time.
export const completed = {
  filter: {
    bool: {
      must: [
        { exists: { field: 'due_date' } },
        { exists: { field: 'completed_date' } },
        { term: { 'status': 2 } },
        { script: { script: painlessCompareTwoDates('completed_date', '<=', 'due_date') } },
      ],
    },
  },
  aggs: simpleValueCount(),
}

// Nodes completed late.
export const completedLate = {
  filter: {
    bool: {
      must: [
        { exists: { field: 'due_date' } },
        { exists: { field: 'completed_date' } },
        { term: { 'status': 2 } },
        { script: { script: painlessCompareTwoDates('completed_date', '>', 'due_date') } },
      ],
    },
  },
  aggs: simpleValueCount(),
}

// Active nodes that have started.
export const started = {
  filter: {
    bool: {
      must: [
        { exists: { field: 'start_date' } },
        { range: { 'start_date': { lt: 'now' } } },
      ],
      must_not: [
        { exists: { field: 'completed_date' } },
        { term: { 'status': 2 } },
      ],
    },
  },
  aggs: simpleValueCount(),
}

// Count workspaces
export const workspaceCounts = {
  terms: { field: 'space_id' },
}

// Total number of unique workspaces in result set.
export const totalUniqueWorkspaces = { cardinality: { field: 'space_id' } }

function painlessCompareTwoDates (left: string, op: string, right: string) {
  return `doc['${left}'].value.getMillis() ${op} doc['${right}'].value.getMillis()`
}

export function simpleValueCount () {
  return { stats: { value_count: { field: '_id' } } }
}
