# IntelliJ Database Tool Configuration Guide for CosmicBoard

## MongoDB Connection Setup

### Prerequisites
1. MongoDB must be running locally
   ```bash
   # Check if MongoDB is running
   brew services list | grep mongodb
   
   # Start MongoDB if not running
   brew services start mongodb-community
   ```

2. IntelliJ IDEA Ultimate (Community Edition doesn't include Database Tools)

### Step-by-Step Configuration

#### 1. Open Database Tool Window
- **Method 1**: View → Tool Windows → Database
- **Method 2**: Click the Database tab on the right side of IntelliJ
- **Method 3**: Press `Cmd+Shift+A` (Mac) or `Ctrl+Shift+A` (Windows/Linux) and search for "Database"

#### 2. Add New Data Source
1. Click the `+` button in the Database tool window
2. Select **Data Source** → **MongoDB**

#### 3. Configure Connection

##### General Tab:
- **Name**: CosmicBoard MongoDB (or any name you prefer)
- **Host**: `localhost`
- **Port**: `27017`
- **Database**: `cosmicboard`
- **Authentication**: None (unless you've configured auth)

##### Connection Settings:
```
Connection URL: mongodb://localhost:27017/cosmicboard
```

##### Advanced Settings (Optional):
- **Read preference**: Primary
- **Connection timeout**: 10000 ms
- **Socket timeout**: 0 ms

#### 4. Test Connection
1. Click **Test Connection** button
2. If successful, you'll see "Connected successfully"
3. If it fails, check:
   - MongoDB is running: `pgrep -x "mongod"`
   - Port 27017 is not blocked: `lsof -i :27017`

#### 5. Apply and Save
1. Click **Apply**
2. Click **OK**

### Using the Database Tool

#### Viewing Data
1. In the Database tool window, expand:
   ```
   CosmicBoard MongoDB
   └── cosmicboard
       └── collections
           ├── projects
           ├── tasks
           └── references
   ```

2. Double-click any collection to view data in table format

#### Running Queries
1. Right-click on the database connection
2. Select **Open Console** → **New Console**
3. Use MongoDB queries:

```javascript
// Find all projects
db.projects.find()

// Find active tasks
db.tasks.find({status: "ACTIVE"})

// Count references
db.references.count()

// Find tasks for a specific project
db.tasks.find({projectId: ObjectId("YOUR_PROJECT_ID")})
```

#### Data Export/Import
- **Export**: Right-click collection → Export Data
- **Import**: Right-click collection → Import Data from File

### MongoDB Collection Schemas

#### Projects Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Tasks Collection
```javascript
{
  _id: ObjectId,
  projectId: ObjectId,
  content: String,
  priority: String, // "LOW", "MEDIUM", "HIGH", "URGENT"
  status: String,   // "ACTIVE", "COMPLETED", "DELETED"
  completedAt: Date,
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### References Collection
```javascript
{
  _id: ObjectId,
  projectId: ObjectId,
  title: String,
  content: String,
  url: String,
  category: String, // "documentation", "snippet", "configuration", "tools"
  priority: String, // "LOW", "MEDIUM", "HIGH"
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Useful MongoDB Commands

```javascript
// Show all databases
show dbs

// Switch to cosmicboard database
use cosmicboard

// Show all collections
show collections

// Get collection statistics
db.tasks.stats()

// Create index for better performance
db.tasks.createIndex({projectId: 1, status: 1})

// Aggregate pipeline example - count tasks by status
db.tasks.aggregate([
  {$group: {_id: "$status", count: {$sum: 1}}}
])
```

### Troubleshooting

#### Connection Refused
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
brew services start mongodb-community

# Check MongoDB logs
tail -f /opt/homebrew/var/log/mongodb/mongo.log
```

#### Authentication Failed
If you have authentication enabled:
1. Create a user for the cosmicboard database
2. Update connection string: `mongodb://username:password@localhost:27017/cosmicboard`

#### Port Already in Use
```bash
# Find what's using port 27017
lsof -i :27017

# Kill the process if needed
kill -9 <PID>
```

### Environment Variables

The application uses this connection string by default:
```
MONGODB_URI=mongodb://localhost:27017/cosmicboard
```

You can override it in `.env.local`:
```bash
# Create .env.local if it doesn't exist
echo "MONGODB_URI=mongodb://localhost:27017/cosmicboard" >> .env.local
```

### Visual Database Design

IntelliJ can generate ER diagrams:
1. Right-click on the database in Database tool
2. Select **Diagrams** → **Show Visualization**
3. Select collections to include in the diagram

### Database Monitoring

IntelliJ provides real-time monitoring:
1. Right-click on connection
2. Select **Database Tools** → **Manage Shown Schemas**
3. Enable **Show server info in tree**

This will display:
- Connection status
- Database size
- Collection counts
- Index information

### Quick Actions

Create these as Live Templates in IntelliJ:

1. **Find Recent Tasks**:
```javascript
db.tasks.find({createdAt: {$gte: new Date(Date.now() - 24*60*60*1000)}}).sort({createdAt: -1})
```

2. **Clean Deleted Tasks**:
```javascript
db.tasks.deleteMany({status: "DELETED", deletedAt: {$lt: new Date(Date.now() - 7*24*60*60*1000)}})
```

3. **Project Summary**:
```javascript
db.projects.aggregate([
  {$lookup: {from: "tasks", localField: "_id", foreignField: "projectId", as: "tasks"}},
  {$project: {name: 1, taskCount: {$size: "$tasks"}}}
])
```