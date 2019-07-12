#import Django
import datetime
import psycopg2
def getCurrentTime():
    now = datetime.datetime.now()
    time = str(now.year) + "-" + str(now.month) + "-" + str(now.day) + "/" + str(now.hour) + "." + str(now.minute) + "." + str(now.second)
    return(time)

class Message:
    def __init__(self):
        now = datetime.datetime.now()
        self.id = 0
        self.name = "world"
        self.module = 0
        self.priority = 0
        self.method = "hello "
        self.fromIp = 0
        self.toIp = 0
        self.reportTime = getCurrentTime();
        self.executeTime = getCurrentTime();
        self.state = 0
        self.testInfo = ""
    def changeId(self,id):
        self.id = id
    def changeName(self,name):
        self.name = name
    def changeModule(self,module):
        self.module = module
    def changePriority(self,priority):
        self.priority = priority
    def changeMethod(self,method):
        self.method = method
    def changeFromIp(self,fromIp):
        self.fromIp = fromIp
    def changeToIp(self,toIp):
        self.toIp = toIp
    def changeReportTime(self,reportTime):
        self.reportTime = reportTime
    def changeexecuteTime(self,executeTime):
        self.executeTime = executeTime
    def changeState(self,state):
        self.state = state
    def changeTestInfo(self,testInfo):
        self.testInfo = testInfo

class Database:
    def __init__(self):
        self.conn = psycopg2.connect(database="postgres",
                                user="postgres",
                                password="awqawqawq",
                                host="127.0.0.1",
                                port="5432")
    print("Opened database successfully")

    def create(self):
        cur = self.conn.cursor()
        sql = '''CREATE TABLE T
               (ID INT PRIMARY KEY    NOT NULL,
                NAME           TEXT   NOT NULL,
                MODULE         INT    NOT NULL,
                PRIORITY       INT    NOT NULL,
                METHOD         TEXT,
                FROMIP         INT    NOT NULL,
                TOIP           INT    NOT NULL,
                REPORTTIME     TEXT   NOT NULL,
                EXECUTETIME    TEXT   NOT NULL,
                STATE          INT    NOT NULL,
                TESTINFO       TEXT);'''
        cur.execute(sql)
        print("Create database successfully")
        return 0

    def insert(self,m):
        cur = self.conn.cursor()
        sql = "INSERT INTO T(ID,NAME,MODULE,PRIORITY,METHOD,FROMIP,TOIP,REPORTTIME,EXECUTETIME,STATE,TESTINFO)\
        VALUES ("+str(m.id)+",'"+m.name+"',"+str(m.module)+","+str(m.priority)+",'"+m.method+"',"+str(m.fromIp)+","+str(m.toIp)+",'"+str(m.reportTime)+"','"+str(m.executeTime)+"',"+str(m.state)+",'"+m.testInfo+"')"

        print(sql)

        #cur.execute("INSERT INTO T(ID, NAME, MODULE, PRIORITY, METHOD, FROMIP, TOIP, REPORTTIME, executeTIME, STATE, TESTINFO)\
        #VALUES(0, 'world', 0, 0, 'hello ', 0, 0, 0, 0, 0, '')")

        cur.execute(sql)
        print("Insert message successfully")
        return 0

    def updateMethod(self,id,method):
        cur = self.conn.cursor()
        time = getCurrentTime()
        sql = "UPDATA T SET METHOD = " + str(method) + ",EXECUTETIME = '" + time + "' WHERE ID = " + str(id)
        cur.execute(sql)
        return 0
    def updateState(self,id,state):
        return 0
    def updateTestInfo(self,id,testInfo):
        return 0

    def delete(self,id):
        cur = self.conn.cursor()
        sql = "DELETE FROM T WHERE ID ="+str(id)+";"
        cur.execute(sql)
        return 0

    def requestAll(self):
        cur = self.conn.cursor()
        sql = "SELECT ID,NAME,MODULE,PRIORITY,METHOD,FROMIP,TOIP,REPORTTIME,EXECUTETIME,STATE,TESTINFO FROM T"
        cur.execute(sql)
        rows = cur.fetchall()
        for row in rows:
            print("ID = ",row[0])
            print("NAME = ",row[1])
            print("MODULE = ",row[2])
            print("PRIORITY = ",row[3])
            print("METHOD = ",row[4])
            print("FROMIP = ",row[5])
            print("TOIP = ",row[6])
            print("REPORTTIME = ",row[7])
            print("executeTIME = ",row[8])
            print("STATE = ",row[9])
            print("TESTINFO = ",row[10])
        print("Request database successfully")
    def close(self):
        self.conn.commit()
        self.conn.close()
        return 0
    def clear(self):
        return 0
    def drop(self):
        cur = self.conn.cursor()
        sql = "DROP TABLE T"
        cur.execute(sql)
        return 0
message = Message()
database = Database()
#database.drop()
#database.create()
database.insert(message)
#database.delete(0)
database.requestAll()
database.close()