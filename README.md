# SmartEarners Backend Features

## INTERNAL TRANSFER

### Check user

post request

Confirm the correct receiver before transfering to them

 ```
    /transfer/check-user

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    D: {
        "accountNumber": "02000741401",
        "amount": 5000
    }

    R: {
        "status": true,
        "msg": "confirmed",
        "data": {
            "username": "user3",
            "email": "user3",
            "accountNumber": "02000741401",
            "amount": "5000.00000000",
            "currency": "SEC"
        }
    }
```


### Pay user

post request

 ```
    /transfer/pay-user

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    D: {
        "accountNumber": "02000741401",
        "amount": 5000
    }

    R: {
        "status": true,
        "msg": "Transaction successful",
        "data": {
            "_id": "62c22f18b8993953ac390dd3",
            "senderId": {
                "_id": "62c1a5701d3aecef92ab70e5",
                "username": "user1",
                "email": "user1"
            },
            "receiverId": {
                "_id": "62c1a5821d3aecef92ab70f1",
                "username": "user3",
                "email": "user3"
            },
            "accountNumber": "02000741401",
            "amount": 5000,
            "currency": "SEC",
            "createdAt": "2022-07-04T00:06:48.110Z",
            "updatedAt": "2022-07-04T00:06:48.110Z",
            "__v": 0
        }
    }

    E: {
        "status": false,
        "msg": "Invalid account number"
    }
```

### Get all transactions

get request

Admin gets all the transactions
Non admin authorized users only get their own transactions (both sent and received transactions if available) otherwise gets empty array
Response is sorted in descending order (more recent has index 0)

```
    /transfer/get-all-transactions

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "Successful",
        "data": [
            {
                "_id": "62c2335d6d9792dcaa9fa313",
                "senderId": {
                    "_id": "62c1a5701d3aecef92ab70e5",
                    "username": "user1",
                    "email": "user1"
                },
                "receiverId": {
                    "_id": "62c1a53e1d3aecef92ab70df",
                    "username": "mozey",
                    "email": "mozey"
                },
                "accountNumber": "02512177402",
                "amount": 10000,
                "currency": "SEC",
                "createdAt": "2022-07-04T00:25:01.823Z",
                "updatedAt": "2022-07-04T00:25:01.823Z",
                "__v": 0
            },
        ]
    }
```

### Get a transactions

get request

Admin gets any transaction that the id is provided
Non admin logged in user only gets his own transaction whose id is provided
Data is an object of a single transaction
If a user tries to get someone else's transaction, he gets an Access deneid error

```
    /transfer/get-transaction/<id>

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "Successful",
        "data": {
            "_id": "62c22e0ba9ca694d23a569db",
            "senderId": {
                "_id": "62c1a5701d3aecef92ab70e5",
                "username": "user1",
                "email": "user1"
            },
            "receiverId": {
                "_id": "62c1a5821d3aecef92ab70f1",
                "username": "user3",
                "email": "user3"
            },
            "accountNumber": "02000741401",
            "amount": 5000,
            "currency": "SEC",
            "createdAt": "2022-07-04T00:02:19.079Z",
            "updatedAt": "2022-07-04T00:02:19.079Z",
            "__v": 0
        }
}
```

## INVESTMENT

### Set plan

post request

Any plan can be set, all the fields are required
When a plan type is name master as in above, amount must be 200000, this amount is the minimum limit for master plan (It is a special package). When an amount is set to be 200000 or more, type must be set to masternotherwsie error
This minimun limit can be changed by the admin in the config but name is fixed to be master

 ```
    /investment/set-plan/

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    D: {
        "type": "Master",
        "amount": 200000,
        "lifespan": "20",
        "returnPercentage": "3"
    }

    R: {
        "status": true,
        "msg": "successful",
        "data": {
            "type": "MASTER",
            "amount": 200000,
            "currency": "SEC",
            "lifespan": "20",
            "returnPercentage": "3",
            "_id": "62c2381294b90298d3d8c241",
            "createdAt": "2022-07-04T00:45:06.169Z",
            "updatedAt": "2022-07-04T00:45:06.169Z",
            "__v": 0
        }
    }

    E: {
        "status": false,
        "msg": "Plan already exist"
    }
```

### Update plan

post request

Any plan can be set, all the fields are required
When a plan type is name master as in above, amount must be 200000, this amount is the minimum limit for master plan (It is a special package). When an amount is set to be 200000 or more, type must be set to masternotherwsie error
This minimun limit can be changed by the admin in the config but name is fixed to be master
lifespan is in seconds

 ```
    /investment/update-plan/<id>

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    D: {
        "type": "Master",
        "amount": 200000,
        "lifespan": "20",
        "returnPercentage": "16575"
    }

    R: {
        "status": true,
        "msg": "successful",
        "data": {
            "type": "MASTER",
            "amount": 200000,
            "currency": "SEC",
            "lifespan": "16575",
            "returnPercentage": "3",
            "_id": "62c2381294b90298d3d8c241",
            "createdAt": "2022-07-04T00:45:06.169Z",
            "updatedAt": "2022-07-04T00:45:06.169Z",
            "__v": 0
        }
    }
```


### Delete plan

delete request

 ```
    /investment/delete-plan/<id>

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "Plan deleted",
        "data": {
            "_id": "62c23a36aa49b1ade23878e7",
            "type": "Master",
            "amount": 200000,
            "currency": "SEC",
            "lifespan": "20",
            "returnPercentage": "3",
            "createdAt": "2022-07-04T00:54:14.339Z",
            "updatedAt": "2022-07-04T00:54:14.339Z",
            "__v": 0
        }
    }
```

### Delete all plans

delete request

 ```
    /investment/delete-all-plans

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "All plans deleted",
        "data": []
    }
```

### Get all plans

get request

Response is sorted in ascending order of the plan amount (least amount has index 0)

 ```
    /investment/get-all-plans

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
    "status": true,
    "msg": "suucessful",
    "data": [
            {
                "_id": "62c23ee1aa49b1ade23878f7",
                "type": "Master",
                "amount": 200000,
                "currency": "SEC",
                "lifespan": 20,
                "returnPercentage": 3,
                "createdAt": "2022-07-04T01:14:09.888Z",
                "updatedAt": "2022-07-04T01:14:09.888Z",
                "__v": 0
            }
        ]
    }
```

### Get plan

get request

 ```
    /investment/get-plan/<id>

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R:{
        "status": false,
        "msg": "successful",
        "data": {
            "_id": "62c23fdbb6da8fb937df1e1b",
            "type": "Master",
            "amount": 200000,
            "currency": "SEC",
            "lifespan": 20,
            "returnPercentage": 40,
            "createdAt": "2022-07-04T01:18:19.601Z",
            "updatedAt": "2022-07-04T01:18:19.601Z",
            "__v": 0
        }
    }
```

### Invest

post request

Body is not required in any of the plan selected, except master plan that amount must be provided and must be equal to or more than the minimun amount for master plan

 ```
    /investment/get-plan/<id>

    D: {
        "amount" : 40000000
    }

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "You have started investment for undefined",
        "data": {
            "_id": "62c245938aaa9307eef65854",
            "planId": {
                "_id": "62c23fdbb6da8fb937df1e1b",
                "type": "Master",
                "amount": 200000,
                "currency": "SEC",
                "lifespan": 20,
                "returnPercentage": 40,
                "createdAt": "2022-07-04T01:18:19.601Z",
                "updatedAt": "2022-07-04T01:18:19.601Z",
                "__v": 0
            },
            "userId": "62c1a5701d3aecef92ab70e5",
            "amount": 40000000,
            "rewarded": false,
            "rewards": 0,
            "currency": "SEC",
            "isActive": true,
            "createdAt": "2022-07-04T01:42:43.296Z",
            "updatedAt": "2022-07-04T01:42:43.296Z",
            "__v": 0
        }
    }
```

A user cannot have more than two active plans
A user cannot have same plan active at same time

### Get all investments

get request

 ```
    /investment/get-all-investments

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
    "status": true,
    "msg": "Successful",
    "data": [
            {
                "_id": "62c24c515066e096da1967ea",
                "planId": {
                    "_id": "62c23fb3b6da8fb937df1e12",
                    "type": "Diamond",
                    "amount": 70000,
                    "currency": "SEC",
                    "lifespan": 20,
                    "returnPercentage": 40,
                    "createdAt": "2022-07-04T01:17:39.877Z",
                    "updatedAt": "2022-07-04T01:17:39.877Z",
                    "__v": 0
                },
                "userId": {
                    "_id": "62c24c075066e096da1967d6",
                    "username": "user4",
                    "email": "user4"
                },
                "amount": 70000,
                "rewarded": false,
                "rewards": 0,
                "currency": "SEC",
                "isActive": true,
                "createdAt": "2022-07-04T02:11:29.263Z",
                "updatedAt": "2022-07-04T02:11:29.263Z",
                "__v": 0
            },
        ]
    }
```

### Get an investment

get request

 ```
    /investment/get-all-investments/<id>

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "Success",
        "data": {
            "_id": "62c24c515066e096da1967ea",
            "planId": {
                "_id": "62c23fb3b6da8fb937df1e12",
                "type": "Diamond",
                "amount": 70000,
                "currency": "SEC",
                "lifespan": 20,
                "returnPercentage": 40,
                "createdAt": "2022-07-04T01:17:39.877Z",
                "updatedAt": "2022-07-04T01:17:39.877Z",
                "__v": 0
            },
            "userId": {
                "_id": "62c24c075066e096da1967d6",
                "username": "user4",
                "email": "user4"
            },
            "amount": 70000,
            "rewarded": false,
            "rewards": 0,
            "currency": "SEC",
            "isActive": true,
            "createdAt": "2022-07-04T02:11:29.263Z",
            "updatedAt": "2022-07-04T02:11:29.263Z",
            "__v": 0
        }
    }
```


### resolve

get request

 ```
    /investment/resolve

    R: {
        "status": true,
        "msg": "Success",
    }
```


## REFERRAL BONUS

### Get all referral bonuses

get request

 ```
    /referral-bonus/get-all-bonuses

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
    "status": true,
    "msg": "Successful",
    "data": [
            {
                "_id": "62c26828fc8e360d4062748b",
                "referrerId": {
                    "_id": "62c26719fc8e360d40627452",
                    "username": "user1",
                    "email": "user1"
                },
                "referreeId": {
                    "_id": "62c26758fc8e360d40627460",
                    "username": "user3",
                    "email": "user3",
                    "hasInvested": true,
                    "firstInvestmentPlanValue": 500,
                    "hasReturnedReferralRewards": true
                },
                "referralRewards": 50,
                "createdAt": "2022-07-04T04:10:16.938Z",
                "updatedAt": "2022-07-04T04:10:16.938Z",
                "__v": 0
            },
        ]
    }
```

### Get a referral bonus

get request

 ```
    /referral-bonus/get-bonus/<id>

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "Success",
        "data": {
            "_id": "62c26828fc8e360d40627486",
            "referrerId": {
                "_id": "62c26719fc8e360d40627452",
                "username": "user1",
                "email": "user1"
            },
            "referreeId": {
                "_id": "62c2674ffc8e360d40627458",
                "username": "user2",
                "email": "user2",
                "hasInvested": true,
                "firstInvestmentPlanValue": 300000,
                "hasReturnedReferralRewards": true
            },
            "referralRewards": 30000,
            "createdAt": "2022-07-04T04:10:16.658Z",
            "updatedAt": "2022-07-04T04:10:16.658Z",
            "__v": 0
        }
    }
```

### Get a referral bonus

put request

 ```
    /referral-bonus/add-referral-code

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    D: {
        "refcode": "91ce088b6b"
    }

    R: {
        "status": true,
        "msg": "You have been successfully added to the referree list of user3"
    }
```

## WITHDRAWAL

### request

post request

Sending request to the admin for approval or rejection

 ```
   /withdrawal/request

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    D: {
        "amount": 5000,
        "walletAddress": "ggdtydye673487ffvt",
        "coin": "USDT(bep20)"
    }

    R: {
        "status": true,
        "msg": "Pending transaction, will be confirmed within 24 hours",
        "data": {
            "_id": "62c284d3270767f25eab3728",
            "userId": {
                "_id": "62c26719fc8e360d40627452",
                "username": "user1",
                "email": "user1"
            },
            "walletAddress": "ggdtydye673487ffvt",
            "amount": 5000,
            "currency": "SEC",
            "coin": "USDT(bep20)",
            "status": "pending",
            "resolved": false,
            "createdAt": "2022-07-04T06:12:35.608Z",
            "updatedAt": "2022-07-04T06:12:35.608Z",
            "__v": 0
        }
    }
```

### reject

get request

 ```
    /withdrawal/rejected/<id>

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "withdrawal to this wallet ggdtydye673487ffvt was rejected",
        "data": {
            "_id": "62c2bf1448bedd4a9964d360",
            "userId": {
                "_id": "62c26719fc8e360d40627452",
                "username": "user1",
                "email": "user1"
            },
            "walletAddress": "ggdtydye673487ffvt",
            "amount": 10000,
            "currency": "SEC",
            "coin": "USDT(bep20)",
            "status": "rejected",
            "resolved": false,
            "createdAt": "2022-07-04T10:21:08.986Z",
            "updatedAt": "2022-07-04T10:21:21.294Z",
            "__v": 0
        }
    }
```

### confirm

put request

 ```
    /withdrawal/confirm/<id>

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    D: {
        "amount": 5000
    }

    R: {
        "status": true,
        "msg": "Transaction confirmed",
        "data": {
            "_id": "62c286cfa536caf5ac5ec6a0",
            "userId": "62c26719fc8e360d40627452",
            "walletAddress": "ggdtydye673487ffvt",
            "amount": 5000,
            "currency": "SEC",
            "coin": "USDT(bep20)",
            "status": "confirmed",
            "resolved": false,
            "createdAt": "2022-07-04T06:21:03.811Z",
            "updatedAt": "2022-07-04T09:03:56.486Z",
            "__v": 0
        }
}
```

### Get all transactions

get request

 ```
    /withdrawal/get-all-transactions

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "success",
        "data": [
            {
                "_id": "62c2c00448bedd4a9964d373",
                "userId": "62c2674ffc8e360d40627458",
                "walletAddress": "ggdtydye673487ffvt",
                "amount": 10000,
                "currency": "SEC",
                "coin": "USDT(bep20)",
                "status": "pending",
                "resolved": false,
                "createdAt": "2022-07-04T10:25:08.826Z",
                "updatedAt": "2022-07-04T10:25:08.826Z",
                "__v": 0
            }
        ]
    }
```

### Get transaction

get request

 ```
    /withdrawal/get-transaction/<id>

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "success",
        "data": {
            "_id": "62c2c00448bedd4a9964d373",
            "userId": "62c2674ffc8e360d40627458",
            "walletAddress": "ggdtydye673487ffvt",
            "amount": 10000,
            "currency": "SEC",
            "coin": "USDT(bep20)",
            "status": "pending",
            "resolved": false,
            "createdAt": "2022-07-04T10:25:08.826Z",
            "updatedAt": "2022-07-04T10:25:08.826Z",
            "__v": 0
        }
    }
```


## AUTH

### Signup on development

#### When VERIFY_EMAIL option in the config database is 'no'

post request

 ```
    /auth/signup

    D: {
        "email": "example@gmail.com",
        "username": "example",
        "password": "123456",
        "cpassword": "123456"
    }

    R: {
        "status": true,
        "msg": "You are registerd successfully"
    }

```
* After registration is success, refreshtoken and accesstoken are sent to the brower in cookie, hence the user will be logged (Implement this in the client side)

#### When VERIFY_EMAIL option in the config database is 'yes'

post request

 ```
    /auth/signup

    D: {
        "email": "example@gmail.com",
        "username": "example",
        "password": "123456",
        "cpassword": "123456"
    }

    R: {
        "status": true,
        "msg": "On development mode! Please check below to verify your account",
        "token": "A0OD3ertgP7MxUutfjNamJHbDCLtxeMhM478no-nOJCj9phvZT9oNgMx63pTeeH3rqajTA57od3b9xL6OY4UsQ"
    }

```
* After registration is success, refreshtoken and accesstoken are sent to the brower in cookie, hence the user will be logged (Implement this in the client side)

* token is returned in the response, this token is manually pass to the as query string in auth/verify-account end point (seen later) to verify-account controller for account verification thereafter, the token will be removed from the auth database and isVerified will be changed to true, user becomes a verified users.

* There are some end permision that are granted to unverified users, more are granted to verified users

* Unverified users may be wipped from the database, though this is left to the descretion of the admin as he may decides to keep unverified users forever via auth/remove-unverified-users (seen later)

* token can be resent to the user if the curent is being mis-placed via auth/resend-verification-link end point (seen later)

### Signup on production

#### When VERIFY_EMAIL option in the config database is 'no' (same with that of dev)

post request

 ```
    /auth/signup

    D: {
        "email": "example@gmail.com",
        "username": "example",
        "password": "123456",
        "cpassword": "123456"
    }

    R: {
        "status": true,
        "msg": "You are registerd successfully"
    }

```

* After registration is success, refreshtoken and accesstoken are sent to the brower in cookie, hence the user will be logged (Implement this in the client side)

#### When VERIFY_EMAIL option in the config database is 'yes'

post request

 ```
    /auth/signup

    D: {
        "email": "example@gmail.com",
        "username": "example",
        "password": "123456",
        "cpassword": "123456"
    }

    R: {
        "status": true,
        "msg": "Check your email example@gmail.com to verify your account"
    }

```
* After registration is success, refreshtoken and accesstoken are sent to the brower in cookie, hence the user will be logged (Implement this in the client side)

* link is sent to the email with the token, after clicking on this link, token will be sent as query string in auth/verify-account end point (seen later) to verify-account controller for account verification thereafter, the token will be removed from the auth database and isVerified will be changed to true, user becomes a verified users.

* There are some end permision that are granted to unverified users, more are granted to verified users

* Unverified users may be wipped from the database, though this is left to the descretion of the admin as he may decides to keep unverified users forever via auth/remove-unverified-users (seen later)

* token can be resent to the user if the curent is being mis-placed via auth/resend-verification-link end point (seen later)



### Signin

post request

 ```
    /auth/signin

    D: {
        email: "<email or username>",
        password: "123456"
    }

    R: {
        "status": true,
        "msg": "You are logged in"
    }
```
* After registration is success, refreshtoken and accesstoken are sent to the brower in cookie, hence the user will be logged (Implement this in the client side)

### Send verification link (on production or development and verify_email is set to yes)

get request

 ```
    /auth/resend-verification-link

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "email sent",
        "token": "<if verify_email is set to yes>"

    }
```

### Verify account

get request

 ```
    /verify-account?token=<token>

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "Your account is verified",

    }
```

### Reset password request

post request

 ```
    /auth/reset-pass-request

    D: {
        "email": "<email of username>"
    }

    R: {
        "status": true,
        "msg": "Link sent to your email",
        "token" "<token if on development>"

    }
```

### Reset password

post request

 ```
    /auth/reset-pass/?token=<token>

    D: {
        "email": "<email of username>"
    }

    R: {
        "status": true,
        "msg": "Link sent to your email",
        "token" "<token if on development>"

    }
```

* The koken can be pass as query string manually on dev mode or by clicking the link in the email on production mode

### Get all users

get request

 ```
    /auth/get-all-users

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "successfull",
        "data": [
            {
                "_id": "62c26758fc8e360d40627460",
                "username": "user3",
                "email": "user3",
                "amount": 600400,
                "currency": "SEC",
                "accountNumber": "02342510215",
                "isAdmin": true,
                "token": "",
                "isVerified": true,
                "isBlocked": false,
                "hasInvested": true,
                "firstInvestmentPlanValue": 500,
                "referralCode": "9b2533f84d",
                "referree": [
                    {
                        "_id": "62c2d0a322702230363fb2e5",
                        "username": "user4",
                        "email": "user4",
                        "hasInvested": false,
                        "firstInvestmentPlanValue": null,
                        "hasReturnedReferralRewards": false
                    },
                ],
                "referrerId": {
                    "_id": "62c26719fc8e360d40627452",
                    "username": "user1",
                    "email": "user1"
                },
                "hasReturnedReferralRewards": true,
                "createdAt": "2022-07-04T04:06:48.412Z",
                "updatedAt": "2022-07-04T11:36:03.450Z",
                "__v": 0
            },
        ]
    }
```

### Get a user

get request

 ```
    /auth/get-user/<id>

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "successfull",
        "data": {
            "_id": "62c26758fc8e360d40627460",
            "username": "user3",
            "email": "user3",
            "amount": 600400,
            "currency": "SEC",
            "accountNumber": "02342510215",
            "isAdmin": true,
            "token": "",
            "isVerified": true,
            "isBlocked": false,
            "hasInvested": true,
            "firstInvestmentPlanValue": 500,
            "referralCode": "9b2533f84d",
            "referree": [
                {
                    "_id": "62c2d0a322702230363fb2e5",
                    "username": "user4",
                    "email": "user4",
                    "hasInvested": false,
                    "firstInvestmentPlanValue": null,
                    "hasReturnedReferralRewards": false
                },
            ],
            "referrerId": {
                "_id": "62c26719fc8e360d40627452",
                "username": "user1",
                "email": "user1"
            },
            "hasReturnedReferralRewards": true,
            "createdAt": "2022-07-04T04:06:48.412Z",
            "updatedAt": "2022-07-04T11:36:03.450Z",
            "__v": 0
        },
    }
```

### Update phone

put request

 ```
    /auth/get-user/<id>

    H: {
        "Authorization: Bearer <accesstoken>"
    }


    D: {
        "phone": "08029360307"
    }

    R: {
        "status": true,
        "msg": "Profile has been updated",
        "data": {
            "avater": null,
            "_id": "62c26758fc8e360d40627460",
            "username": "user3",
            "email": "user3",
            "amount": 600400,
            "currency": "SEC",
            "accountNumber": "02342510215",
            "isAdmin": true,
            "token": "",
            "isVerified": true,
            "isBlocked": false,
            "hasInvested": true,
            "firstInvestmentPlanValue": 500,
            "referralCode": "9b2533f84d",
            "referree": [
                {
                    "_id": "62c2d0a322702230363fb2e5",
                    "username": "user4",
                    "email": "user4",
                    "hasInvested": false,
                    "firstInvestmentPlanValue": null,
                    "hasReturnedReferralRewards": false
                }
            ],
            "referrerId": {
                "_id": "62c26719fc8e360d40627452",
                "username": "user1",
                "email": "user1"
            },
            "hasReturnedReferralRewards": true,
            "createdAt": "2022-07-04T04:06:48.412Z",
            "updatedAt": "2022-07-04T11:50:18.434Z",
            "__v": 0,
            "phone": "08036000307"
        }
    }
```

### Logout

Both accesstoken and refreshtoken will be deleted from browser cookie so that accesstoken cannot be passed in header for authorization, refreshtoken to generate new accesstoken, then user must log in again

get request

 ```
    /auth/logout

    R: {
        "status": true,
        "msg": "You have been Logged out"
    }
```

### GenerateAccesstoken
Refreshtoken is passed through http header as seen below, new accesstoken and resfreshtoken with new lifespan are generated and stored in browser cookie. This keeps the user logged in as long as the app is not kept domant for a time more than the lifespan of the refreshtoken

get request

 ```
    /auth/generate-accesstoken

    H: {
        "Authorization: Bearer <refreshtoken>"
    }    
```

### Block user
If the id passed is that of admin's, error will be thrown, "Admin's account cannot be blocked"

put request

 ```
    /auth/block-user/<id>

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "User has been blocked"
    }
```

### Unblock user

put request

 ```
    /auth/unblock-user/<id>

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "User has been unblocked"
    }
```

### Delete account
Only the admin and the account owners can delete account, admin account cannot be deleted"

delete request

 ```
    /auth/delete-account/<id>

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "User has been deleted",
        "data": {
            "avater": null,
            "phone": null,
            "_id": "62c2674ffc8e360d40627458",
            "username": "user2",
            "email": "user2",
            "password": "$2b$10$LtTCvu8j7a7brBan8x81Uu0w1kojnNCp2mDUB32ojvGWA3rElckwC",
            "amount": 589000,
            "currency": "SEC",
            "accountNumber": "02410761212",
            "isAdmin": false,
            "token": "",
            "isVerified": true,
            "isBlocked": true,
            "hasInvested": true,
            "firstInvestmentPlanValue": 300000,
            "referralCode": "449fb9bad5",
            "referree": [],
            "referrerId": "62c26719fc8e360d40627452",
            "hasReturnedReferralRewards": true,
            "createdAt": "2022-07-04T04:06:39.685Z",
            "updatedAt": "2022-07-04T12:30:59.432Z",
            "__v": 0
        }
    }
```

### Delete all accounts
Only the admin can delete all accounts, admin account cannot be deleted"

delete request

 ```
    /auth/delete-all-accounts

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "User has been deleted",
        "data": [
            {
                "avater": null,
                "phone": null,
                "_id": "62c2674ffc8e360d40627458",
                "username": "user2",
                "email": "user2",
                "password": "$2b$10$LtTCvu8j7a7brBan8x81Uu0w1kojnNCp2mDUB32ojvGWA3rElckwC",
                "amount": 589000,
                "currency": "SEC",
                "accountNumber": "02410761212",
                "isAdmin": false,
                "token": "",
                "isVerified": true,
                "isBlocked": true,
                "hasInvested": true,
                "firstInvestmentPlanValue": 300000,
                "referralCode": "449fb9bad5",
                "referree": [],
                "referrerId": "62c26719fc8e360d40627452",
                "hasReturnedReferralRewards": true,
                "createdAt": "2022-07-04T04:06:39.685Z",
                "updatedAt": "2022-07-04T12:30:59.432Z",
                "__v": 0
            },
        ]
    }
```

### Remove unverified users
These are users that registered but do not verify their accounts, removing them is completely the decision of the admin, this can be configure from config using the unverifyUserLifeSpan setting it to seconds.
When set to 0, all unverified users stays for the lifespan of the app except the account is explicitly deleted by thr account owner or the admin.
When set to any value other than 0, this is regarded as seconds.
When this time is elapsed starting from the time the account was created, the account is deleted forever

get request

 ```
    /auth/remove-unverified-users

    R: {
        "status": true,
        "msg": "Unverified Users removed successfully"
    }
```


### Upload user profile

put request

 ```
    /upload-user-image
    

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    D: {
        "imgae: ""
    }

    R: {
        "status": true,
        "msg": "Profile has been uploaded",
        "data": {
            "imageName": "6408e0aecda744bd90d415bd8d57ea38.jpg",
            "imageSize": 37075,
            "imagePath": "C:\\Users\\MOZEY\\Desktop\\DEV\\smartEanersBackend/uploads/1657285744335_6408e0aecda744bd90d415bd8d57ea38.jpg",
            "_id": "62c82c703783ffacf92c8a4d",
            "__v": 0
        }
    }
```

### Update user profile

put request

 ```
   /upload-user-image?id=<id>
    

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    D: {
        "imgae: ""
    }

    R: {
        "status": true,
        "msg": "Profile has been updated",
        "data": {
            "imageName": "6408e0aecda744bd90d415bd8d57ea38.jpg",
            "imageSize": 37075,
            "imagePath": "C:\\Users\\MOZEY\\Desktop\\DEV\\smartEanersBackend/uploads/1657285744335_6408e0aecda744bd90d415bd8d57ea38.jpg",
            "_id": "62c82c703783ffacf92c8a4d",
            "__v": 0
        }
    }
```

### Remove user profile

delete request

 ```
    /remove-user-image/<id>

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "Profile image removed",
        "data": {
            "_id": "62c82c703783ffacf92c8a4d",
            "imageName": null,
            "imageSize": null,
            "imagePath": null,
            "__v": 0
        }
    }
```

## WEBSITE CONFIG

### get

get request
All the default configs will be returned as an object if not set before or will be set and returned the object

 ```
    /config/get

    R: {
        "status": true,
        "msg": "success",
        "data": {
            "_id": "62c283a06454c018da445c82",
            "name": "SmartEarners",
            "bio": "We Trade it, You Learn & Earn it",
            "aboutUs": "SmartEarners is a trustworthy platform that has been in existence for years serving several financial institutions across the world. We have had major rights and praises of good reputation amongst the section of investment platforms for trading and circular form of rewards.",
            "benefits": [
                "benefit1",
            ],
            "customerSupport": "yes",
            "unverifyUserLifeSpan": 0,
            "conversionRate": 500,
            "nativeCurrency": "SEC",
            "tradeCurrency": "USD",
            "brandColorA": "rgb(0, 65, 93)",
            "brandColorB": "rgb(241 173 0)",
            "brandColorC": "rgb(241 173 0)",
            "verifyEmail": "no",
            "contacts": [
                "contact1",
            ],
            "investmentLimits": 2,
            "investmentRewardsPercentage": 10,
            "minWithdrawalLimit": 5000,
            "maxWithdrawalLimit": 100000,
            "withdrawalCommomDiff": 5000,
            "masterPlanAmountLimit": 200000,
            "withdrawalFactors": [
                5000,
            ],
            "withdrawalCoins": [
                "LITECOIN",
            ],
            "minDepositLimit": 5000,
            "createdAt": "2022-07-04T06:07:28.352Z",
            "updatedAt": "2022-07-04T06:07:28.352Z",
            "__v": 0
        }
    }
```

### update

if not data passed, the already existing config will be returned as object, but when data is/are passed, the config will be updated and the updated ones will be returned as an object

put request

 ```
    /config/update

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "success",
        "data": {
            "_id": "62c283a06454c018da445c82",
            "name": "SmartEarners",
            "bio": "We Trade it, You Learn & Earn it",
            "aboutUs": "SmartEarners is a trustworthy platform that has been in existence for years serving several financial institutions across the world. We have had major rights and praises of good reputation amongst the section of investment platforms for trading and circular form of rewards.",
            "benefits": [
                "benefit1",
            ],
            "customerSupport": "yes",
            "unverifyUserLifeSpan": 0,
            "conversionRate": 500,
            "nativeCurrency": "SEC",
            "tradeCurrency": "USD",
            "brandColorA": "rgb(0, 65, 93)",
            "brandColorB": "rgb(241 173 0)",
            "brandColorC": "rgb(241 173 0)",
            "verifyEmail": "no",
            "contacts": [
                "contact1",
            ],
            "investmentLimits": 2,
            "investmentRewardsPercentage": 10,
            "minWithdrawalLimit": 5000,
            "maxWithdrawalLimit": 100000,
            "withdrawalCommomDiff": 5000,
            "masterPlanAmountLimit": 200000,
            "withdrawalFactors": [
                5000,
            ],
            "withdrawalCoins": [
                "LITECOIN",
            ],
            "minDepositLimit": 5000,
            "createdAt": "2022-07-04T06:07:28.352Z",
            "updatedAt": "2022-07-04T06:07:28.352Z",
            "__v": 0
        }
    }
```


### update logo

pending for now

put request

 ```
    /config/update-logo

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: { }
```

## DEPOSIT
