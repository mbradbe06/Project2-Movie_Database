import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, jsonify, render_template


#################################################
# Database Setup
#################################################
# rds_connection_string = f'postgres:postgres@localhost:5432/movies'
# engine = create_engine(f'postgresql://{rds_connection_string}')
url = 'postgres://zttrfwwdkbvjri:993e860c0b322e56c742c10a0edd25113b9ed456845f9c82571ae166641b32f3@ec2-100-25-100-81.compute-1.amazonaws.com:5432/d90qpidcl4m7ls'
engine = sqlalchemy.create_engine(url)
# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

print(Base.classes.keys())

# Save reference to the table
Movie = Base.classes.movie
Genre = Base.classes.genre
# mgjunct = Base.classes.movie_genre_junction
country = Base.classes.country_origin
countryjunct = Base.classes.movie_country_junction
companyname = Base.classes.production_company


# Create our session (link) from Python to the DB
session = Session(engine)

#################################################
# Flask Setup
#################################################
app = Flask(__name__)


#################################################
# Flask Routes
#################################################
@app.route("/")
def welcome():
    return render_template('index.html')
        # f"Welcome to our movie database API!<br/>"
        # f"Available Routes:<br/>"
        # f"/api/v1.0/movies<br/>"
        # f"/api/v1.0/companies<br/>"
        # f"/api/v1.0/tbd<br/>"
        # f"/api/v1.0/tbd"
        

@app.route("/api/v1.0/movies")
def movie_info():
    movie_info = session.query(Movie.movie_title, Movie.year_published,\
                               Movie.movie_duration, Movie.budget, Movie.usa_gross_income,\
                               Movie.worlwide_gross_income,\
                               country.country_name, country.lat, country.long, Movie.votes_avg,\
                            #    Genre.genre_name,\
                               companyname.company_name).filter(\
                               Movie.movie_id == countryjunct.movie_id).filter(\
                               Movie.company_id == companyname.company_id).filter(\
                            #    Movie.movie_id == mgjunct.movie_id).filter(\
                            #    mgjunct.genre_id == Genre.genre_id).filter(\
                               countryjunct.country_id == country.country_id).\
                               all()

    session.close()
    #Create list of movie information
    movie_list = []
    for title, year, duration, budget, us, worldwide, country_name, lat, lng, avg_votes, company in movie_info:
        movie_dict = {}
        movie_dict['title'] = title
        movie_dict['year_pub'] = year
        movie_dict['duration'] = duration
        movie_dict['budget'] = budget
        movie_dict['us_gross'] = us
        movie_dict['ww_gross'] = worldwide 
        movie_dict['country'] = country_name
        movie_dict['lat'] = lat
        movie_dict['lng'] = lng
        movie_dict['avg_votes'] = avg_votes
        # movie_dict['genre'] = avg_votes
        movie_dict['company'] = company
        movie_list.append(movie_dict)

    return jsonify(movie_list)

# @app.route("/api/v1.0/companies")
# def movie_company():
#     movie_info = session.query(Movie.movie_title, Movie.year_published,\
#                                Movie.movie_duration, Movie.budget, Movie.usa_gross_income,\
#                                Movie.worlwide_gross_income, companyname.company_name, Movie.votes_avg).filter(\
#                                Movie.company_id == companyname.company_id).\
#                                limit(100).all()

#     session.close()
#     #Create list of movie information
#     movie_list = []
#     for title, year, duration, budget, us, worldwide, company, avg_votes in movie_info:
#         movie_dict = {}
#         movie_dict['title'] = title
#         movie_dict['year_pub'] = year
#         movie_dict['duration'] = duration
#         movie_dict['budget'] = budget
#         movie_dict['us_gross'] = us
#         movie_dict['ww_gross'] = worldwide 
#         movie_dict['company'] = company
#         movie_dict['avg_votes'] = avg_votes
#         movie_list.append(movie_dict)

#     return jsonify(movie_list)

if __name__ == "__main__":   
    app.run(debug=True)