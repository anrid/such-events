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
  const User = await db.class.create('User', 'V')
  console.log(`Created class ${User.name} (${User.superClass}).`)

  const Workspace = await db.class.create('Workspace', 'V')
  console.log(`Created class ${Workspace.name} (${Workspace.superClass}).`)

  const Team = await db.class.create('Team', 'V')
  console.log(`Created class ${Team.name} (${Team.superClass}).`)

  // Create User class properties.

  r = await User.property.create([
    { name: 'name', type: 'String', notNull: true },
    { name: 'email', type: 'String', notNull: true },
    { name: 'age', type: 'Integer' },
    { name: 'photo', type: 'String' },
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
    { name: 'logo', type: 'String' },
    { name: 'created', type: 'DateTime' },
    { name: 'updated', type: 'DateTime' },
    { name: 'owner', type: 'Link', linkedClass: 'User', notNull: true },
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

  const getId = r => r['@rid'].toString()

  // HACK: Circumvent TypeScript for a moment.
  let user1 = await User.create.call(User, {
    name: 'Ace Base',
    email: 'ace.base@example.com',
    photo: 'https://cdn.com/123/user1-photo.jpg',
    created: new Date(),
    updated: new Date(),
  })
  console.log(`Created user ${user1.name} (id: ${getId(user1)}).`)

  let user2 = await User.create.call(User, {
    name: 'Chase Case',
    email: 'chase.case@example.com',
    photo: 'https://cdn.com/123/user2-photo.jpg',
    created: new Date(),
    updated: new Date(),
  })
  console.log(`Created user ${user2.name} (id: ${getId(user2)}.`)

  let workspace1 = await Workspace.create.call(Workspace, {
    name: 'Ace’s Space',
    logo: 'https://cdn.com/123/456.jpg',
    created: new Date(),
    updated: new Date(),
    owner: user1['@rid'],
  })
  console.log(`Created workspace1 ${workspace1.name} (id: ${getId(workspace1)}).`)

  let workspace2 = await Workspace.create.call(Workspace, {
    name: 'My New Startup',
    logo: 'https://cdn.com/123/789.jpg',
    created: new Date(),
    updated: new Date(),
    owner: user1['@rid'],
  })
  console.log(`Created workspace2 ${workspace2.name} (id: ${getId(workspace2)}).`)

  //
  // Select all workspaces where the owner's name is "Ace Base"
  // and join in all owner info.
  // 
  r = await db.query(`
    SELECT
      name,
      logo,
      owner       AS owner_id,
      owner.name  AS owner_name,
      owner.email AS owner_email,
      owner.photo AS owner_photo
    FROM Workspace
    WHERE owner.name = "Ace Base"
  `)
  console.log(
    `Select all workspaces owned by Ace Base:\n` +
    r.map(x => `- ${x.name} (owner: ${x.owner_name})`).join(`\n`)
  )

  // Add workspace1 and workspace2 to user1’s workspaces set.
  // NOTE: Adding workspace2 several shouldn't have any effect since we've
  // declared a LinkSet type on the workspaces property.
  user1.workspaces = [workspace1['@rid'], workspace2['@rid'], workspace2['@rid'], workspace2['@rid']]
  await db.record.update(user1)

  // Add workspace2 to user2’s workspaces set.
  user2.workspaces = [workspace2['@rid']]
  await db.record.update(user2)

  // Add user1 as admin and member of workspace1.
  workspace1.admins = [user1['@rid']]
  workspace1.members = [user1['@rid']]
  await db.record.update(workspace1)

  // Add user1 as admin and member of workspace2 and
  // user2 as member.
  workspace2.admins = [user1['@rid']]
  workspace2.members = [user1['@rid'], user2['@rid']]
  await db.record.update(workspace2)

  //
  // Select all users where the owner's name is "Ace Base"
  // and join in all owner info.
  // 
  r = await db.query(`
    SELECT
      name,
      email,
      photo,
      workspaces       AS workspace_id,
      workspaces.name  AS workspace_name,
      workspaces.logo  AS workspace_logo
    FROM User
    WHERE name IN ["Chase Case", "Ace Base"]
    AND workspaces.name LIKE '%Startup'
  `)
  console.log(`Found ${r.length} users:\n`, r)

  // user1 = await db.record.get(user1)
  // console.log(user1)

  // console.log(r)

  // const rec1 = await db.record.get('#1:1')
  // console.log(rec1)

  server.close()
}
