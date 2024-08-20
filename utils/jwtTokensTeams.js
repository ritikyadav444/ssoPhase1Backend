const nodeMailer = require("nodemailer");
const dotenv = require("dotenv").config();
const path = require("path");

const verifyTeamMail = async (user_email, combined_email, role, link, workspace_name) => {
    try {
        const transporter = nodeMailer.createTransport({
            host: process.env.SMPT_HOST,
            port: process.env.SMPT_PORT,
            service: process.env.SMPT_SERVICE,
            auth: {
                user: process.env.SMPT_EMAIL,
                pass: process.env.SMPT_PASSWORD
            }
        });

        // Construct the email content
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
                            border-radius: 5px;
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
                            <div>Welcome, join and complete your registration</div>
                            <div>Invitation By: ${combined_email}</div>
                            <div>Role: ${role}</div>
                            <div>Join: <a href="${link}">Click this Link</a></div>
                            <div>Workspace: ${workspace_name}</div>
                        </div>
                    </div>
                </body>
            </html>
        `;

        // Send the email
        let info = await transporter.sendMail({
            from: process.env.SMPT_EMAIL,
            to: user_email,
            subject: "Account verification",
            text: "Welcome",
            html: emailContent,
            attachments: [{
                filename: "agencyKinetics.jpg",
                path: logoPath,
                cid: "agencyKinetics"
            }]
        });

        console.log("Mail sent successfully", link);
    } catch (error) {
        console.log(error, "Mail failed to send");
    }
};

module.exports = verifyTeamMail;
