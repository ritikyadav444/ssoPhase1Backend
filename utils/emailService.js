const nodemailer = require('nodemailer');
const dotenv = require("dotenv").config()
const path = require("path");



// Function to send email
async function sendEmail(to, subject, password, workspace_name, createdAt, link) {
    
    // const emailData = {
    //     from: process.env.SMPT_EMAIL,
    //     to:to,
    //     subject:subject,
    //     text:text,
    // };

    try {
        // Nodemailer setup
    const transporter = nodemailer.createTransport({
        host: process.env.SMPT_HOST,
        port: process.env.SMPT_PORT,
        service: process.env.SMPT_SERVICE,
        auth: {
            user: process.env.SMPT_EMAIL,
            pass: process.env.SMPT_PASSWORD
        }
    });
    
    const logoPath = path.join(__dirname, "../images/agencyKinetics.jpg");
        const emailContent = `
            <html>
                <head>
                    <style>
                        .card {
                            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
                            width: 700px;
                            margin: auto;
                            text-align: center;
                            font-family: Arial, sans-serif;
                            border-radius: 5px;

                            border: 1px solid rgb(127, 86, 217); /* Set border color */
                        }
                        
                        .card-content {
        
                            background-color: rgb(127, 86, 217); /* Set background color */
                            padding: 20px;
                        }
                        
                        .card img {
                            width: 100px;
                            height: 100px;
                            border-radius: 50%; /* Make the image circular */
                        }
                        
                        h1 {
                            color: white; /* Set text color to white */
                        }
                        
                        .title {
                            color: grey;
                            font-size: 18px;
                        }

                        .invitation-details {
                            font-size: 16px;
                            margin-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="card-content">
                            <img src="cid:agencyKinetics" alt="Agency Kinetics Logo">
                            <h1>Agency Kinetics</h1>
                        </div>

                        <div class="title">
                            <div>Your account has been created.</div>
                            <div>Email: ${to}</div>
                            <div>Password: ${password}</div>
                            <div>Created At: ${createdAt}</div>
                            <div>Workspace: ${workspace_name}</div>
                            <div>To Login: <a href="${link}">Click this Link</a></div>

                        </div>
                    </div>
                </body>
            </html>
        `;
        let info = await transporter.sendMail({
            from: process.env.SMPT_EMAIL,
            to: to,
            subject: "Account Created",
            text: "Welcome",
            html: emailContent,
            attachments: [{
                filename: "agencyKinetics.jpg",
                path: logoPath,
                cid: "agencyKinetics"
            }]
        });
        console.log('Email sent successfully:', link);
        return info; // Return the info object on success
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Throw the error on failure
    }
}

module.exports = { sendEmail };