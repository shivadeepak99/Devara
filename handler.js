const path = require('path');
const con = require('./dbcon/db');
const bcrypt = require('bcrypt');
const raw = path.join(__dirname);

const baseget=(req, res) => {
    if (!req.session.customerID) {
        return res.redirect('/dashboard');
    }
    const isNewUser = req.session.newUser;
    req.session.newUser = false;
    return res.render('dashboard', { Naam: req.session.customerName,cid:req.session.customerID,isNewUser
        ,Account_NO:"1",Account_type:"1",created_date:"1",branch_name:"1"
    });

};
const getdashboard=(req,res)=>{
    return res.sendFile(raw+'/dashboard.ejs');
}

const loginget= (req, res) => {
    res.sendFile(path.join(raw, '/login.html'));
};

const loginpost = (req, res) => {
    console.log(req.body);
    const { Customer_ID, password } = req.body;

    if (!Customer_ID || !password) {
        return res.status(400).send('Customer ID and password are required.');
    }

    const loginQuery = 'SELECT * FROM customer WHERE Customer_ID = ?';

    con.query(loginQuery, [Customer_ID], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send('Database error occurred.');
        }

        if (results.length === 0) {
            return res.status(404).send('Customer not found. Invalid account details.');
        }

        const customer = results[0];

        // Check if password exists in the database result
        if (!customer.password) {
            console.error("Customer password not found in database.");
            return res.status(500).send('Customer password not found.');
        }

        // Log the hashed and plain passwords
        console.log("Customer password (hashed):", customer.password);
        console.log("Entered password (plain):", password);

        // Compare the passwords using bcrypt
        if (bcrypt.compareSync(password, customer.password)) {
            req.session.customerID = customer.Customer_ID;
            req.session.customerName = customer.Name;
            req.session.phone = customer.phone_number;
            console.log("Customer with ID:", Customer_ID, "logged in successfully!");
            return res.redirect('/');
        } else {
            return res.status(401).send('Incorrect password. Please try again.');
        }
    });
};



const logoutget=(req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Cannot log out. Please try again!");
        }
        console.log("customer logged out");
        res.redirect('./dashboard.html');
    });
};


const registerpost=(req, res) => {
    const { phone_number, Name, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    var Customer_ID=rancusid()
    console.log(Customer_ID)
    const addQuery = 'INSERT INTO customer (customer_id, phone_number, name, password) VALUES (?, ?, ?, ?)';

    con.query(addQuery, [Customer_ID, phone_number, Name, hashedPassword], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Unexpected error occurred.');
        }
        console.log(result);
        req.session.newUser = true;
        res.render('dashboard.ejs',{cid:Customer_ID,Naam:req.session.customerName})

    });
};

const registerget=(req,res)=>{
    res.sendFile(raw+"/register.html")
}
const recoveryget = (req, res) => {

    res.render('recovery');
};


const recoverypost = (req, res) => {
    const { Cid, Name, Phone } = req.body;
    console.log('Received for recovery:', { Cid, Name, Phone });

    let q = 'SELECT c.Name, c.phone_number,c.password FROM customer c WHERE c.Customer_ID = ?';

    con.query(q, [Cid], (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).send({ message: 'Internal server error' });
        }

        if (results.length === 0) {
            console.log('No customer found with provided Customer_ID.');
            return res.status(400).send({ message: 'Customer not found.' });
        }

        console.log('Query results:', results);

        const customer = results[0];
        if (customer.Name === Name && customer.phone_number === Phone) {
           req.session.customerID=Cid;
            console.log('Customer details verified successfully.');
            return res.status(200).render('passupdate', {message:'Verification successful. Proceed with password recovery.'} );
        } else {
            console.log('Name or phone number does not match.');
            return res.status(400).send('Name or phone number does not match.' );
        }
    });
};

const profileget=(req,res)=>{
    res.status(200).render('profile',{pname:req.session.customerName
        ,pemail:"NA",pphno:req.session.phone,padr:"NA"

    });

}
const profilepost = (req, res) => {
    const { password, name, email, phone, address } = req.body;

    const loginQuery = 'SELECT * FROM customer WHERE Customer_ID = ?';

    con.query(loginQuery, [req.session.customerID], (err, results) => {
        if (err) {
            return res.status(500).send('Database error occurred.');
        }

        if (results.length === 0) {
            return res.status(404).send('Customer not found. Invalid account details.');
        }

        const customer = results[0];

        if (bcrypt.compareSync(password, customer.password)) {
            const updateFields = [];
            const updateValues = [];
            const sessionu=[];

            if (name) {
                updateFields.push('Name = ?');
                updateValues.push(name);
                sessionu.push('req.session.customerName')
            }
            if (email) {
                updateFields.push('Email = ?');
                updateValues.push(email);
                sessionu.push('req.session.email')
            }
            if (phone) {
                updateFields.push('Phone = ?');
                updateValues.push(phone);
                sessionu.push('req.session.phone_number')
            }
            if (address) {
                updateFields.push('Address = ?');
                updateValues.push(address);
                sessionu.push('req.session.address')
            }

            if (updateFields.length === 0) {
                return res.status(400).send('No fields to update.');
            }
updateValues.push(req.session.customerID)
            const updateQuery = `
                UPDATE customer 
                SET ${updateFields.join(', ')} 
                WHERE Customer_ID = ?
            `;

            con.query(updateQuery, updateValues, (err, updateResult) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Failed to update customer details.');
                }
                for(i=0;i<updateFields.length;i++){
                    sessionu[i]=updateValues[i]
                }

                return res.status(200).send('Customer updated successfully');


            });
        } else {
            return res.status(401).send('Incorrect password. Please try again.');
        }
    });
};
const updpass = (req, res) => {
    const { newpaass, renewpass } = req.body;

    // Log request body for debugging
    console.log("Request body in updpass:", req.body);

    // Validate passwords
    if (!newpaass || !  renewpass) {
        return res.status(400).send("Both password fields are required.");
    }

    if (newpaass !== renewpass) {
        return res.status(400).send("Passwords do not match.");
    }

    // Hash the new password
    const hashedPassword = bcrypt.hashSync(newpaass, 10);
    const rlist = [hashedPassword, req.session.customerID];

    const updatepass = `
        UPDATE customer 
        SET password=? 
        WHERE Customer_ID = ?
    `;

    // Update password in database
    con.query(updatepass, rlist, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Failed! Cannot update password at the moment. Please try again.");
        }

        // Destroy the session
        req.session.destroy((err) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error logging out after password update.");
            }

            // Send success response
            res.send(`
                <html>
                    <style>
                        body { background: linear-gradient(45deg, blue, black); }
                    </style>
                    <script> alert('Password updated successfully! Please re-login.');</script>
                    <meta http-equiv="refresh" content="2; url='./login' ">
                    <h1 style="color: yellow; text-align: left; font-weight: bolder; font-size: xxx-large">Redirecting...</h1>
                </html>
            `);
        });
    });
};
const admget=(req,res)=>{
    return res.status(200).sendFile(raw +"/adminlogin.html")
}

const adminpost=(req,res)=>{
    const{admin_username,admin_password}=req.body;
    return res.send("this feature will be enabled soon!!  ")
}
const gettransaction_history = (req, res) => {
    const tran = `SELECT * FROM transactions WHERE Customer_ID = ?`;

    con.query(tran, [req.session.customerID], (err, results) => {
        if (err) {
            console.log("Cannot fetch transaction query");
            return res.status(500).send("Database error!!");
        }

        res.render('transactions', { transactions: results });
    });
};

module.exports={
    gettransaction_history,
    adminpost,
    admget,
    getdashboard,
    updpass,
    profileget,
    profilepost,
    registerget,
    baseget,
    loginget,
    loginpost,
    logoutget,
    registerpost,
    recoveryget,
    recoverypost
}

function rancusid(){
var a=Math.random()
    a=a*1000000
    a=Math.round(a)
    console.log(a)
return a

}