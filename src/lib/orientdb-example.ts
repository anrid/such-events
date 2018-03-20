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

  //
  // Create User class properties.
  //
  r = await User.property.create([
    { name: 'name', type: 'String', notNull: true },
    { name: 'email', type: 'String', notNull: true },
    { name: 'age', type: 'Integer' },
    { name: 'photo', type: 'String' },
    { name: 'created', type: 'DateTime' },
    { name: 'updated', type: 'DateTime' },
    // { name: 'workspaces', type: 'LinkSet', linkedClass: 'Workspace' },
    // { name: 'teams', type: 'LinkSet', linkedClass: 'Team' },
    { name: 'isActive', type: 'Boolean', default: true },
  ])

  // 
  // Create Workspace class properties.
  //
  r = await Workspace.property.create([
    { name: 'name', type: 'String', notNull: true },
    { name: 'logo', type: 'String' },
    { name: 'created', type: 'DateTime' },
    { name: 'updated', type: 'DateTime' },
    // { name: 'owner', type: 'Link', linkedClass: 'User', notNull: true },
    // { name: 'members', type: 'LinkSet', linkedClass: 'User' },
    // { name: 'admins', type: 'LinkSet', linkedClass: 'User' },
    { name: 'isActive', type: 'Boolean', default: true },
  ])
  // console.log(`Workspace properties:\n - ${r.map(x => `${x.name} (type: ${x.type})`).join('\n - ')}`)

  //
  // Create Team class properties.
  //
  r = await Team.property.create([
    { name: 'name', type: 'String', notNull: true },
    { name: 'created', type: 'DateTime' },
    { name: 'updated', type: 'DateTime' },
    // { name: 'teamLead', type: 'Link', linkedClass: 'User' },
    // { name: 'members', type: 'LinkSet', linkedClass: 'User' },
    // { name: 'admins', type: 'LinkSet', linkedClass: 'User' },
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

  let user3 = await User.create.call(User, {
    name: 'Massa Man',
    email: 'massa.man@example.com',
    photo: 'https://cdn.com/123/user3-photo.jpg',
    created: new Date(),
    updated: new Date(),
  })
  console.log(`Created user ${user3.name} (id: ${getId(user3)}.`)

  let workspace1 = await Workspace.create.call(Workspace, {
    name: 'Ace’s Space',
    logo: 'https://cdn.com/123/456.jpg',
    created: new Date(),
    updated: new Date(),
  })
  console.log(`Created workspace1 ${workspace1.name} (id: ${getId(workspace1)}).`)

  let workspace2 = await Workspace.create.call(Workspace, {
    name: 'My New Startup',
    logo: 'https://cdn.com/123/789.jpg',
    created: new Date(),
    updated: new Date(),
  })
  console.log(`Created workspace2 ${workspace2.name} (id: ${getId(workspace2)}).`)

  // Create basic relationship edges.
  await db.class.create('WorkspaceOwner', 'E')
  await db.class.create('WorkspaceAdmin', 'E')
  await db.class.create('WorkspaceMember', 'E')

  // user1 owns both workspaces and is the only admin.
  await db.create('EDGE', 'WorkspaceOwner').from(getId(user1)).to(getId(workspace1)).one()
  await db.create('EDGE', 'WorkspaceOwner').from(getId(user1)).to(getId(workspace2)).one()
  await db.create('EDGE', 'WorkspaceAdmin').from(getId(user1)).to(getId(workspace1)).one()
  await db.create('EDGE', 'WorkspaceAdmin').from(getId(user1)).to(getId(workspace2)).one()

  // user1 is a member of both workspaces.
  // user2 and user3 are members of workspace2.
  await db.create('EDGE', 'WorkspaceMember').from(getId(user1)).to(getId(workspace1)).one()
  await db.create('EDGE', 'WorkspaceMember').from(getId(user1)).to(getId(workspace2)).one()
  await db.create('EDGE', 'WorkspaceMember').from(getId(user2)).to(getId(workspace2)).one()
  await db.create('EDGE', 'WorkspaceMember').from(getId(user3)).to(getId(workspace2)).one()

  //
  // Select all workspaces where the owner's name is "Ace Base"
  // and join in all owner info.
  // 
  r = await db.query(`
    SELECT
      name,
      logo,
      IN('WorkspaceOwner').@rid AS ownerId,
      IN('WorkspaceOwner').name AS ownerName,
      IN('WorkspaceAdmin').@rid AS adminId,
      IN('WorkspaceAdmin').name AS adminName,
      IN('WorkspaceMember').@rid AS memberId,
      IN('WorkspaceMember').name AS memberName
    FROM Workspace
    WHERE IN('WorkspaceAdmin').name LIKE '%Ace%'
  `)
  .all()
  console.log(`Found ${r.length} workspaces:\n`, r)

  //
  // Select all users where the owner's name is "Ace Base"
  // and join in all owner info.
  // 
  r = await db.query(`
    SELECT
      name,
      email,
      photo,
      OUT('WorkspaceMember').@rid AS workspaceId,
      OUT('WorkspaceMember').name AS workspaceName,
      OUT('WorkspaceMember').logo AS workspaceLogo
    FROM User
    WHERE
      name IN ['Ace Base']
      AND OUT('WorkspaceMember').name LIKE '%Startup%'
  `)
  .all()
  console.log(`Found ${r.length} users:\n`, r)

  server.close()
}
