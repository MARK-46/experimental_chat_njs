# Install
```bash
# cloning the project 
git clone https://github.com/MARK-46/experimental_chat_njs.git
cd ./experimental_chat_njs

# installing packages
npm install

# creating environment file from example
cp configs/.env.example configs/.env
```

Open the configs/.env file and chang db connection deteils and import sql file to your MySQL database.

~ DB File: ./src/database/experimental.sql

```ini
DB0_HOST="127.0.0.1"
DB0_PORT="3306"
DB0_USERNAME="************"
DB0_PASSWORD="************"
```

# Run
```bash
# build all ts files and run index.js from ./build directory
npm start 

# or. install pm2 module globally to run app in background
npm install pm2 -g

# pm2 ecosystem configuration initialization 
#     or deleting an existing configuration
npm run pm2-init
npm run pm2-remove

# start/restart/stop project in background
npm run pm2-start
npm run pm2-stop
npm run pm2-restart
```

# Rest APIs
[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/2803724-2b93fea3-9a7f-434e-87de-671ec5a5f882?action=collection%2Ffork&collection-url=entityId%3D2803724-2b93fea3-9a7f-434e-87de-671ec5a5f882%26entityType%3Dcollection%26workspaceId%3Dbe781ae3-7faa-471d-ab5f-62edac5e442b)


To set up the Postman environment, you need to run the gateway api.

```http
GET /api/gateway?version=0.0.1&platform=android HTTP/1.1
Host: 127.0.0.1:1998
ex-language: en
```

Then you need to register a new user.

```http
POST /api/register HTTP/1.1
Host: 127.0.0.1:1998
ex-language: en
Content-Length: 698
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

----WebKitFormBoundary
Content-Disposition: form-data; name="username"

MARK46
----WebKitFormBoundary
Content-Disposition: form-data; name="password"

admin123456
----WebKitFormBoundary
Content-Disposition: form-data; name="confirm_password"

admin123456
----WebKitFormBoundary
Content-Disposition: form-data; name="email"

mark.38.98.ii@gmail.com
----WebKitFormBoundary
Content-Disposition: form-data; name="avatar"; filename="/C:/Users/Mark/Downloads/avatar.png"
Content-Type: image/png

(data)
----WebKitFormBoundary
Content-Disposition: form-data; name="name"

Mark
----WebKitFormBoundary
```

Successful response:

```json
{
    "error": false,
    "message": null,
    "data": {
        "result": {
            "access_token": {
                "token": "22F89C62DF9BFF8DD5C784A06E67C092C009940AC5E07C785C6C04034247972B6357DB19B139C281EC3CD8C4B8A36B830144E45CC1D112DA421E48F77ABA2091",
                "expires_at": "2022-02-04T20:52:38.723Z",
                "created_at": "2022-02-01T20:52:38.723Z"
            },
            "refresh_token": {
                "token": "85BDB6BB9D4DCF09BD92E36C2B7CF775E6AC934341BE28FAABBA48F10EED55B8DE7054E6EE2A309B7F947EDCCB76064DE99F3E2334C2739959D5E4DDF250E5A1",
                "expires_at": "2022-03-03T20:52:38.601Z",
                "created_at": "2022-02-01T20:52:38.600Z"
            },
            "user": {
                "user_id": "a412e4e1-cc5a-4541-b35a-54dc6d523200",
                "user_role": 4,
                "user_name": "Mark",
                "user_email": "mark.38.98.ii@gmail.com",
                "user_status": 1,
                "user_username": "MARK46",
                "user_image": "http://127.0.0.1:1998/static/guest.png",
                "user_created_at": "2022-02-01T20:52:38.515Z",
                "user_updated_at": "2022-02-01T20:52:38.515Z",
                "user_role_label": "User",
                "user_online": false
            }
        }
    }
}
```

Then copy the token from the access_token object.

Open the link [http://127.0.0.1:1998/](http://127.0.0.1:1998/) and paste the token into the request parameter in the open dialog box and click the connect button to test the Socket.IO connection.

![CONNECTION DIALOG](public\uploads\img1.png)

If you successfully connected to socket.io, you received a socket_id and signal event with your profile data.

![SUCCESS CONNECTION](public\uploads\img2.png)

End.

Thank you for your attention :)