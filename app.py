from flask import Flask, request, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# --- CONFIGURATION FOR SQLITE ---
# Using SQLite database for local development
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///corporate_wellness.db'
# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/yakkai_neri_db' // use this for mysql
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
    return render_template("index.html")

# Route to render the corporate yoga form
@app.route("/corporate-yoga")
def corporate_yoga():
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

# Route to render admin panel
@app.route("/admin")
def admin():
    return render_template("admin.html")

# Route to get all wellness submissions (for admin)
@app.route("/api/wellness_data")
def get_wellness_data():
    try:
        submissions = WellnessSubmission.query.all()
        data = []
        for submission in submissions:
            data.append({
                'id': submission.id,
                'company_code': submission.company_code,
                'name': submission.name,
                'email': submission.email,
                'mobile': submission.mobile,
                'designation': submission.designation,
                'total_score': submission.total_score,
                'submission_date': submission.submission_date.strftime('%Y-%m-%d %H:%M:%S') if submission.submission_date else None,
                'responses': {
                    'q1': submission.q1, 'q2': submission.q2, 'q3': submission.q3,
                    'q4': submission.q4, 'q5': submission.q5, 'q6': submission.q6,
                    'q7': submission.q7, 'q8': submission.q8, 'q9': submission.q9,
                    'q10': submission.q10, 'q11': submission.q11, 'q12': submission.q12
                }
            })
        return {'success': True, 'data': data, 'count': len(data)}
    except Exception as e:
        return {'success': False, 'error': str(e)}, 500

# Route to get all company registrations (for admin)
@app.route("/api/company_data")
def get_company_data():
    try:
        companies = Company.query.all()
        data = []
        for company in companies:
            data.append({
                'id': company.id,
                'company_name': company.company_name,
                'contact_person': company.contact_person,
                'email': company.email,
                'phone': company.phone,
                'employee_count': company.employee_count,
                'industry': company.industry,
                'company_code': company.company_code,
                'created_date': company.created_date.strftime('%Y-%m-%d %H:%M:%S') if company.created_date else None
            })
        return {'success': True, 'data': data, 'count': len(data)}
    except Exception as e:
        return {'success': False, 'error': str(e)}, 500

# Route to serve static JSON data for admin panel
@app.route("/data/programs-data.json")
def get_programs_data():
    # Return default program data structure
    data = {
        "programs": {
            "yoga-as-sport": {
                "title": "Yoga as Sport",
                "icon": "fas fa-medal",
                "description": "Competitive yoga training for tournaments and championships",
                "content": "Yoga has evolved beyond a mere spiritual and physical practice to become a recognized competitive sport.",
                "highlight": "We are the only academy in the region with certified competitive yoga judges.",
                "status": "active",
                "lastUpdated": "Today"
            },
            "corporate-yoga": {
                "title": "Corporate Yoga",
                "icon": "fas fa-briefcase",
                "description": "Workplace wellness programs for stress management",
                "content": "Modern workplaces face unprecedented stress levels affecting employee productivity.",
                "highlight": "We provide on-site corporate training with measurable wellness outcomes.",
                "status": "active",
                "lastUpdated": "Today"
            },
            "yoga-for-sport": {
                "title": "Yoga for Sport",
                "icon": "fas fa-running",
                "description": "Enhance athletic performance with yoga techniques",
                "content": "Athletic performance optimization through yoga is scientifically proven.",
                "highlight": "We combine ancient yoga wisdom with modern sports science.",
                "status": "active",
                "lastUpdated": "Today"
            },
            "women-wellness": {
                "title": "Women Wellness",
                "icon": "fas fa-female",
                "description": "Specialized programs for women's health issues",
                "content": "Women face unique physiological challenges throughout their lives.",
                "highlight": "Our programs are designed specifically for women's unique health challenges.",
                "status": "active",
                "lastUpdated": "Today"
            },
            "prenatal-postnatal": {
                "title": "Prenatal & Postnatal",
                "icon": "fas fa-baby",
                "description": "Yoga for expecting and new mothers",
                "content": "Pregnancy and childbirth represent profound transformations.",
                "highlight": "We provide comprehensive support for the entire journey from pregnancy through early motherhood.",
                "status": "active",
                "lastUpdated": "Today"
            },
            "adolescence": {
                "title": "Adolescence",
                "icon": "fas fa-user-graduate",
                "description": "Yoga for teenagers dealing with hormonal changes",
                "content": "Teenagers face complex hormonal, physical, and emotional changes.",
                "highlight": "We understand the unique challenges teenagers face and provide supportive guidance.",
                "status": "active",
                "lastUpdated": "Today"
            },
            "therapy": {
                "title": "Therapy",
                "icon": "fas fa-heartbeat",
                "description": "Yoga as remedy for various health conditions",
                "content": "Non-communicable diseases represent major health threats in modern society.",
                "highlight": "We combine yoga therapy with medical expertise to provide comprehensive healing approaches.",
                "status": "active",
                "lastUpdated": "Today"
            },
            "tech-supported": {
                "title": "Tech-supported Yoga",
                "icon": "fas fa-microchip",
                "description": "Combining tradition with modern technology",
                "content": "Innovation meets tradition in our tech-supported yoga programs.",
                "highlight": "We are the first academy to successfully integrate AI and IoT technology with traditional yoga practices.",
                "status": "active",
                "lastUpdated": "Today"
            }
        },
        "pages": {}
    }
    return data

# Route to serve index.html directly
@app.route("/index.html")
def index_html():
    return render_template("index.html")

# Additional routes for various pages referenced in templates
@app.route("/wellness.html")
def wellness_html():
    return render_template("wellness.html")

@app.route("/therapy.html") 
def therapy_html():
    return render_template("therapy.html")

@app.route("/women-seniors.html")
def women_seniors_html():
    return render_template("women-seniors.html")

@app.route("/professional.html")
def professional_html():
    return render_template("professional.html")

@app.route("/workshops.html")
def workshops_html():
    return render_template("Workshops.html")

@app.route("/meet-the-trainer.html")
def meet_trainer_html():
    return render_template("meet-the-trainer.html")

@app.route("/contact.html")
def contact_html():
    return render_template("contact.html")

# Missing routes for specialty pages
@app.route("/yoga-as-sport.html")
def yoga_sport_html():
    return render_template("yoga-as-sport.html")

@app.route("/yoga-for-sport.html")
def yoga_for_sport_html():
    return render_template("yoga-for-sport.html")

@app.route("/women-wellness.html")
def women_wellness_html():
    return render_template("Women-Wellness.html")

@app.route("/prenatal-postnatal.html")
def prenatal_postnatal_html():
    return render_template("Prenatal & Postnatal.html")

@app.route("/adolescence.html")
def adolescence_html():
    return render_template("Adolescence.html")

@app.route("/tech-supported-yoga.html")
def tech_yoga_html():
    return render_template("Tech-supported Yoga.html")

@app.route("/corporate-yoga.html")
def corporate_yoga_html():
    return render_template("corporate-yoga.html")

# Catch-all route for missing static files to prevent 404s
@app.errorhandler(404)
def not_found_error(error):
    return render_template("index.html"), 200

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