import * as OrientDB from 'orientjs'

run().catch(err => console.error(err))

export async function run () { 
  const server = OrientDB({
    host: 'localhost',
    port: 2424,
    username: 'root',
    password: 'root',
  })

  const dbName = 'testdb'
  let r

  // List all dbs.
  const dbs = await server.list()
  console.log('List of all dbs:', dbs.map(x => x.name))

  // Fetch test db.
  if (dbs.find(x => x.name === dbName)) {
    // Delete test db if it exists.
    console.log(`Found db ${dbName}, dropping ..`)
    await server.drop(dbName)
  }

  // Create test db.
  console.log(`Creating db ${dbName} ..`)
  r = await server.create({
    name: dbName,
    type: 'graph',
    storage: 'plocal',
  })
  console.log(`Created db ${r.name} successfully (username: ${r.username}, password: ${r.password}).`)

  // Use the newly created test db.
  const db = await server.use({
    name: dbName,
  })
  console.log(`Using db ${db.name}.`)

  // List all classes associated with test db.
  const classes = await db.class.list(100)
  console.log(classes.map(x => x.name))

  // Create User, Team and Workspace classes.
  const User = await db.class.create('User')
  console.log(`Created class ${User.name}.`)

  const Workspace = await db.class.create('Workspace')
  console.log(`Created class ${Workspace.name}.`)

  const Team = await db.class.create('Team')
  console.log(`Created class ${Team.name}.`)

  // Create User class properties.

  r = await User.property.create([
    { name: 'name', type: 'String', notNull: true },
    { name: 'age', type: 'Integer' },
    { name: 'created', type: 'DateTime' },
    { name: 'updated', type: 'DateTime' },
    { name: 'workspaces', type: 'LinkSet', linkedClass: 'Workspace' },
    { name: 'teams', type: 'LinkSet', linkedClass: 'Team' },
    { name: 'isActive', type: 'Boolean', default: true },
  ])
  // console.log(`User properties:\n - ${r.map(x => `${x.name} (type: ${x.type})`).join('\n - ')}`)

  // Create Workspace class properties.
  r = await Workspace.property.create([
    { name: 'name', type: 'String', notNull: true },
    { name: 'created', type: 'DateTime' },
    { name: 'updated', type: 'DateTime' },
    { name: 'owner', type: 'Link', linkedClass: 'User' },
    { name: 'members', type: 'LinkSet', linkedClass: 'User' },
    { name: 'admins', type: 'LinkSet', linkedClass: 'User' },
    { name: 'isActive', type: 'Boolean', default: true },
  ])
  // console.log(`Workspace properties:\n - ${r.map(x => `${x.name} (type: ${x.type})`).join('\n - ')}`)

  // Create Team class properties.
  r = await Team.property.create([
    { name: 'name', type: 'String', notNull: true },
    { name: 'created', type: 'DateTime' },
    { name: 'updated', type: 'DateTime' },
    { name: 'teamLead', type: 'Link', linkedClass: 'User' },
    { name: 'members', type: 'LinkSet', linkedClass: 'User' },
    { name: 'admins', type: 'LinkSet', linkedClass: 'User' },
  ])
  // console.log(`Team properties:\n - ${r.map(x => `${x.name} (type: ${x.type})`).join('\n - ')}`)

  // HACK: Circumvent TypeScript for a moment.
  const user1 = await User.create.call(User, {
    name: 'Ace Base',
    created: new Date(),
    updated: new Date(),
  })
  console.log(`Created user ${user1.name} (id: ${user1['@rid'].toString()}).`)

  const user2 = await User.create.call(User, {
    name: 'Chase Case',
    created: new Date(),
    updated: new Date(),
  })
  console.log(`Created user ${user2.name} (id: ${user2['@rid'].toString()}).`)

  // const rec1 = await db.record.get('#1:1')
  // console.log(rec1)

  server.close()
}
