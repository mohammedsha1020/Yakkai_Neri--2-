from flask import Flask, request, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# --- CONFIGURATION FOR SQLITE ---
# Using SQLite database for local development
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///corporate_wellness.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# -----------------------------------

db = SQLAlchemy(app)

# Define table structure for wellness submissions
class WellnessSubmission(db.Model):
    __tablename__ = 'wellness_assessments'
    id = db.Column(db.Integer, primary_key=True)
    company_code = db.Column(db.String(50))
    q1 = db.Column(db.String(10))
    q2 = db.Column(db.String(10))
    q3 = db.Column(db.String(10))
    q4 = db.Column(db.String(10))
    q5 = db.Column(db.String(10))
    q6 = db.Column(db.String(10))
    q7 = db.Column(db.String(10))
    q8 = db.Column(db.String(10))
    q9 = db.Column(db.String(10))
    q10 = db.Column(db.String(10))
    q11 = db.Column(db.String(10))
    q12 = db.Column(db.String(10))
    name = db.Column(db.String(100))
    mobile = db.Column(db.String(20))
    email = db.Column(db.String(120))
    designation = db.Column(db.String(100))
    total_score = db.Column(db.Integer)
    submission_date = db.Column(db.TIMESTAMP, default=db.func.current_timestamp())


# Define table structure for companies
class Company(db.Model):
    __tablename__ = 'companies'
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(100), nullable=False)
    contact_person = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    employee_count = db.Column(db.Integer)
    industry = db.Column(db.String(100))
    company_code = db.Column(db.String(50), unique=True, nullable=False)
    created_date = db.Column(db.TIMESTAMP, default=db.func.current_timestamp())

# Create database tables
with app.app_context():
    db.create_all()

# Route to render the main corporate yoga page
@app.route("/")
def home():
    return render_template("corporate-yoga.html", company_code="ABC123")

# Route to serve the wellness form for individuals
@app.route("/wellness_form")
def wellness_form():
    return render_template("individual-wellness.html")

# Route to serve the corporate onboarding form for HR/Team Leads
@app.route("/corporate_onboard")
def corporate_onboard():
    return render_template("hr-register.html")

# Route to handle form submission for the wellness assessment
@app.route("/submit_wellness/<company_code>", methods=["POST"])
def submit_wellness(company_code):
    try:
        print(f"Form submission received for company_code: {company_code}")
        print(f"Form data: {dict(request.form)}")
        
        data = WellnessSubmission(
            company_code=company_code,
            q1=request.form.get("q1"),
            q2=request.form.get("q2"),
            q3=request.form.get("q3"),
            q4=request.form.get("q4"),
            q5=request.form.get("q5"),
            q6=request.form.get("q6"),
            q7=request.form.get("q7"),
            q8=request.form.get("q8"),
            q9=request.form.get("q9"),
            q10=request.form.get("q10"),
            q11=request.form.get("q11"),
            q12=request.form.get("q12"),
            name=request.form.get("name"),
            mobile=request.form.get("mobile"),
            email=request.form.get("email"),
            designation=request.form.get("designation")
        )
        db.session.add(data)
        db.session.commit()
        print("Data saved successfully")
        return redirect(url_for('submission_success'))
    except Exception as e:
        print(f"Error submitting form: {e}")
        db.session.rollback()
        return f"An error occurred: {e}", 500

# Route for a successful submission message
@app.route("/submission_success")
def submission_success():
    return render_template("submission-success.html")

# Route to handle form submission for company registration
@app.route("/submit_company", methods=["POST"])
def submit_company():
    try:
        new_company = Company(
            company_name=request.form.get("company_name"),
            contact_person=request.form.get("contact_person"),
            email=request.form.get("email"),
            phone=request.form.get("phone"),
            employee_count=request.form.get("employee_count"),
            industry=request.form.get("industry"),
            company_code=request.form.get("company_code")
        )
        db.session.add(new_company)
        db.session.commit()
        return redirect(url_for('submission_success'))
    except Exception as e:
        db.session.rollback()
        return f"An error occurred: {e}", 500

if __name__ == "__main__":
    app.run(debug=True)