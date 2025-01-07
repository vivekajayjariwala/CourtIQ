const express = require('express');
const connection = require('./db/database');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// GET all athletes with pagination and search
app.get('/api/athletes', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    // First, get total count for pagination
    const countQuery = `
        SELECT COUNT(*) as total 
        FROM Athlete 
        WHERE player_name LIKE ? 
        OR player_position LIKE ? 
        OR hometown LIKE ?
    `;

    const searchPattern = `%${search}%`;

    connection.query(countQuery, [searchPattern, searchPattern, searchPattern], (err, countResults) => {
        if (err) {
            console.error('Error counting athletes:', err);
            res.status(500).json({ error: 'Error fetching athletes' });
            return;
        }

        const total = countResults[0].total;

        // Then get the actual data
        const query = `
            SELECT * 
            FROM Athlete 
            WHERE player_name LIKE ? 
            OR player_position LIKE ? 
            OR hometown LIKE ?
            LIMIT ? OFFSET ?
        `;

        connection.query(
            query, 
            [searchPattern, searchPattern, searchPattern, limit, offset],
            (err, results) => {
                if (err) {
                    console.error('Error fetching athletes:', err);
                    res.status(500).json({ error: 'Error fetching athletes' });
                    return;
                }
                res.json({
                    athletes: results,
                    total: total,
                    page: page,
                    totalPages: Math.ceil(total / limit)
                });
            }
        );
    });
});

// GET athlete by ID
app.get('/api/athletes/:id', (req, res) => {
    const query = 'SELECT * FROM Athlete WHERE player_ID = ?';
    connection.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching athlete:', err);
            res.status(500).json({ error: 'Error fetching athlete' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Athlete not found' });
            return;
        }
        res.json(results[0]);
    });
});

// Search athletes
app.get('/api/athletes/search', (req, res) => {
    const searchQuery = `%${req.query.q}%`;
    const query = `
        SELECT * FROM Athlete 
        WHERE player_name LIKE ? 
        OR player_position LIKE ? 
        OR hometown LIKE ?
    `;
    connection.query(query, [searchQuery, searchQuery, searchQuery], (err, results) => {
        if (err) {
            console.error('Error searching athletes:', err);
            res.status(500).json({ error: 'Error searching athletes' });
            return;
        }
        res.json(results);
    });
});

// POST new athlete
app.post('/api/athletes', (req, res) => {
    const {
        player_name, player_number, height, weight,
        age, player_position, player_year, hometown, highschool, team_ID
    } = req.body;

    const query = `
        INSERT INTO Athlete (
            player_name, player_number, height, weight,
            age, player_position, player_year, hometown, highschool, team_ID
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    connection.query(query, [
        player_name, player_number, height, weight,
        age, player_position, player_year, hometown, highschool, team_ID
    ], (err, results) => {
        if (err) {
            console.error('Error creating athlete:', err);
            res.status(500).json({ error: 'Error creating athlete' });
            return;
        }
        
        // After inserting, fetch and return the created athlete
        const selectQuery = 'SELECT * FROM Athlete WHERE player_ID = ?';
        connection.query(selectQuery, [results.insertId], (err, selectResults) => {
            if (err) {
                console.error('Error fetching created athlete:', err);
                res.status(201).json({ 
                    id: results.insertId, 
                    message: 'Athlete created successfully' 
                });
                return;
            }
            res.status(201).json({ 
                id: results.insertId, 
                message: 'Athlete created successfully',
                athlete: selectResults[0]
            });
        });
    });
});

// PUT update athlete
app.put('/api/athletes/:id', (req, res) => {
    const {
        player_name, player_number, height, weight,
        player_position, player_year
    } = req.body;

    const query = `
        UPDATE Athlete 
        SET player_name = ?, 
            player_number = ?, 
            height = ?, 
            weight = ?,
            player_position = ?, 
            player_year = ?
        WHERE player_ID = ?
    `;

    connection.query(query, [
        player_name,
        player_number,
        height,
        weight,
        player_position,
        player_year,
        req.params.id
    ], (err, results) => {
        if (err) {
            console.error('Error updating athlete:', err);
            res.status(500).json({ error: 'Error updating athlete' });
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Athlete not found' });
            return;
        }
        res.json({ 
            message: 'Athlete updated successfully',
            athlete: req.body 
        });
    });
});

// DELETE athlete
app.delete('/api/athletes/:id', (req, res) => {
    const query = 'DELETE FROM Athlete WHERE player_ID = ?';
    connection.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error deleting athlete:', err);
            res.status(500).json({ error: 'Error deleting athlete' });
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Athlete not found' });
            return;
        }
        res.json({ message: 'Athlete deleted successfully' });
    });
});

// GET all teams with pagination and search
app.get('/api/teams', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    // First, get total count for pagination
    const countQuery = `
        SELECT COUNT(*) as total 
        FROM Team 
        WHERE team_name LIKE ? 
        OR league LIKE ? 
        OR location LIKE ?
    `;

    const searchPattern = `%${search}%`;

    connection.query(countQuery, [searchPattern, searchPattern, searchPattern], (err, countResults) => {
        if (err) {
            console.error('Error counting teams:', err);
            res.status(500).json({ error: 'Error fetching teams' });
            return;
        }

        const total = countResults[0].total;

        // Then get the actual data
        const query = `
            SELECT * 
            FROM Team 
            WHERE team_name LIKE ? 
            OR league LIKE ? 
            OR location LIKE ?
            LIMIT ? OFFSET ?
        `;

        connection.query(
            query, 
            [searchPattern, searchPattern, searchPattern, limit, offset],
            (err, results) => {
                if (err) {
                    console.error('Error fetching teams:', err);
                    res.status(500).json({ error: 'Error fetching teams' });
                    return;
                }
                res.json({
                    teams: results,
                    total: total,
                    page: page,
                    totalPages: Math.ceil(total / limit)
                });
            }
        );
    });
});

// GET team by ID
app.get('/api/teams/:id', (req, res) => {
    const query = 'SELECT * FROM Team WHERE team_ID = ?';
    connection.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching team:', err);
            res.status(500).json({ error: 'Error fetching team' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Team not found' });
            return;
        }
        res.json(results[0]);
    });
});

// PUT update team
app.put('/api/teams/:id', (req, res) => {
    const {
        team_name, league, wins, losses,
        standing, location
    } = req.body;

    // Calculate record based on wins and losses
    const record = wins + losses > 0 ? wins / (wins + losses) : 0;

    const query = `
        UPDATE Team 
        SET team_name = ?, 
            league = ?, 
            wins = ?, 
            losses = ?,
            record = ?,
            standing = ?, 
            location = ?
        WHERE team_ID = ?
    `;

    connection.query(query, [
        team_name,
        league,
        wins,
        losses,
        record,
        standing,
        location,
        req.params.id
    ], (err, results) => {
        if (err) {
            console.error('Error updating team:', err);
            res.status(500).json({ error: 'Error updating team' });
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Team not found' });
            return;
        }
        res.json({ 
            message: 'Team updated successfully',
            team: {...req.body, record}
        });
    });
});

// DELETE team
app.delete('/api/teams/:id', (req, res) => {
    const query = 'DELETE FROM Team WHERE team_ID = ?';
    connection.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error deleting team:', err);
            res.status(500).json({ error: 'Error deleting team' });
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Team not found' });
            return;
        }
        res.json({ message: 'Team deleted successfully' });
    });
});

// Award Routes
app.post('/api/awards', (req, res) => {
    const { award_name, officiating_body, award_date } = req.body;
    const query = 'INSERT INTO Award (award_name, officiating_body, award_date) VALUES (?, ?, ?)';
    
    connection.query(query, [award_name, officiating_body, award_date], (err, results) => {
        if (err) {
            console.error('Error creating award:', err);
            res.status(500).json({ error: 'Error creating award' });
            return;
        }
        res.status(201).json({ id: results.insertId, message: 'Award created successfully' });
    });
});

// Team Award Routes
app.post('/api/team-awards', (req, res) => {
    const { team_ID, award_ID } = req.body;
    const query = 'INSERT INTO Team_Award (team_ID, award_ID) VALUES (?, ?)';
    
    connection.query(query, [team_ID, award_ID], (err, results) => {
        if (err) {
            console.error('Error creating team award:', err);
            res.status(500).json({ error: 'Error creating team award' });
            return;
        }
        res.status(201).json({ message: 'Team award created successfully' });
    });
});

// Athlete Award Routes
app.post('/api/athlete-awards', (req, res) => {
    const { athlete_ID, award_ID } = req.body;
    const query = 'INSERT INTO Athlete_Award (athlete_ID, award_ID) VALUES (?, ?)';
    
    connection.query(query, [athlete_ID, award_ID], (err, results) => {
        if (err) {
            console.error('Error creating athlete award:', err);
            res.status(500).json({ error: 'Error creating athlete award' });
            return;
        }
        res.status(201).json({ message: 'Athlete award created successfully' });
    });
});

// Game Routes
app.post('/api/games', (req, res) => {
    const { 
        home_team_ID, away_team_ID, home_team_score, away_team_score,
        date, league, match_type 
    } = req.body;
    
    const query = `
        INSERT INTO Game (
            home_team_ID, away_team_ID, home_team_score, away_team_score,
            date, league, match_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    connection.query(query, [
        home_team_ID, away_team_ID, home_team_score, away_team_score,
        date, league, match_type
    ], (err, results) => {
        if (err) {
            console.error('Error creating game:', err);
            res.status(500).json({ error: 'Error creating game' });
            return;
        }
        res.status(201).json({ id: results.insertId, message: 'Game created successfully' });
    });
});

// POST new statistics
app.post('/api/statistics', (req, res) => {
    const {
        player_ID, match_ID, minutes_played,
        field_goals_made, field_goals_attempted,
        three_point_goals_made, three_point_goals_attempted,
        free_throws_made, free_throws_attempted,
        total_rebounds, assists, steals, blocks, turnovers, fouls,
        points
    } = req.body;

    // First check if statistics already exist
    const checkQuery = 'SELECT * FROM Statistic WHERE player_ID = ? AND match_ID = ?';
    connection.query(checkQuery, [player_ID, match_ID], (checkErr, checkResults) => {
        if (checkErr) {
            console.error('Error checking statistics:', checkErr);
            res.status(500).json({ message: 'Error checking statistics' });
            return;
        }

        if (checkResults.length > 0) {
            res.status(400).json({ 
                message: 'Statistics already exist for this player in this game' 
            });
            return;
        }

        // Calculate percentages with zero handling
        const field_goal_percentage = field_goals_attempted > 0 
            ? (field_goals_made / field_goals_attempted) * 100 
            : 0;

        const three_point_percentage = three_point_goals_attempted > 0 
            ? (three_point_goals_made / three_point_goals_attempted) * 100 
            : 0;

        const free_throws_percentage = free_throws_attempted > 0 
            ? (free_throws_made / free_throws_attempted) * 100 
            : 0;

        // Calculate advanced statistics with zero handling
        const minutes = parseFloat(minutes_played) || 0.1; // Avoid division by zero
        const player_rating_per_minute = minutes > 0 
            ? (points + total_rebounds + assists + steals + blocks - turnovers - fouls) / minutes 
            : 0;

        const player_efficiency = minutes > 0 
            ? ((points + total_rebounds + assists + steals + blocks) - 
               (field_goals_attempted - field_goals_made + 
                free_throws_attempted - free_throws_made + turnovers)) / minutes 
            : 0;

        const effective_field_goal_percentage = field_goals_attempted > 0 
            ? ((field_goals_made + (0.5 * three_point_goals_made)) / field_goals_attempted) * 100 
            : 0;

        const true_shooting_percentage = (field_goals_attempted + (0.44 * free_throws_attempted)) > 0 
            ? (points / (2 * (field_goals_attempted + (0.44 * free_throws_attempted)))) * 100 
            : 0;

        const query = `
            INSERT INTO Statistic (
                player_ID, match_ID, minutes_played,
                field_goals_made, field_goals_attempted, field_goal_percentage,
                three_point_goals_made, three_point_goals_attempted, three_point_percentage,
                free_throws_made, free_throws_attempted, free_throws_percentage,
                total_rebounds, assists, steals, blocks, turnovers, fouls,
                points, player_rating_per_minute, player_efficiency,
                effective_field_goal_percentage, true_shooting_percentage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        connection.query(query, [
            player_ID, match_ID, minutes_played,
            field_goals_made, field_goals_attempted, field_goal_percentage,
            three_point_goals_made, three_point_goals_attempted, three_point_percentage,
            free_throws_made, free_throws_attempted, free_throws_percentage,
            total_rebounds, assists, steals, blocks, turnovers, fouls,
            points, player_rating_per_minute, player_efficiency,
            effective_field_goal_percentage, true_shooting_percentage
        ], (err, results) => {
            if (err) {
                console.error('Error creating statistics:', err);
                res.status(500).json({ 
                    message: 'Error creating statistics record: ' + err.message 
                });
                return;
            }
            
            res.status(201).json({ 
                message: 'Statistics created successfully',
                id: results.insertId
            });
        });
    });
});


// GET simplified list of teams (ID and name only)
app.get('/api/list/teams', (req, res) => {
    const query = 'SELECT team_ID, team_name FROM Team ORDER BY team_name ASC';
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching teams for dropdown:', err);
            res.status(500).json({ error: 'Error fetching teams' });
            return;
        }
        res.json({ teams: results });
    });
});

// GET simplified list of athletes (ID and name only)
app.get('/api/list/athletes', (req, res) => {
    const query = 'SELECT player_ID, player_name FROM Athlete ORDER BY player_name ASC';
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching athletes for dropdown:', err);
            res.status(500).json({ error: 'Error fetching athletes' });
            return;
        }
        res.json({ athletes: results });
    });
});

// GET awards list with all fields
app.get('/api/list/awards', (req, res) => {
    const query = 'SELECT award_ID, award_name, officiating_body, award_date FROM Award ORDER BY award_name ASC';
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching awards:', err);
            res.status(500).json({ error: 'Error fetching awards' });
            return;
        }
        res.json({ awards: results });
    });
});

// GET all games
app.get('/api/games', (req, res) => {
    const query = `
        SELECT * 
        FROM Game 
        ORDER BY date DESC
    `;
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching games:', err);
            res.status(500).json({ error: 'Error fetching games' });
            return;
        }
        res.json({ games: results });
    });
});

// Analytics Routes - Updated with LIMIT 5

// GET top scorers by date
app.get('/api/analytics/top-scorers', (req, res) => {
    const gameDate = req.query.date;
    let query = `
        SELECT 
            s.player_ID as id,
            a.player_name as name,
            s.points,
            CONCAT(ht.team_name, ' vs ', at.team_name) as game,
            DATE_FORMAT(g.date, '%Y-%m-%d') as date
        FROM Statistic s
        JOIN Athlete a ON s.player_ID = a.player_ID
        JOIN Game g ON s.match_ID = g.match_ID
        JOIN Team ht ON g.home_team_ID = ht.team_ID
        JOIN Team at ON g.away_team_ID = at.team_ID
    `;
    
    const params = [];
    if (gameDate) {
        query += ` WHERE g.date = ?`;
        params.push(gameDate);
    }
    
    query += ` ORDER BY s.points DESC LIMIT 5`;

    connection.query(query, params, (err, results) => {
        if (err) {
            console.error('Error fetching top scorers:', err);
            res.status(500).json({ error: 'Error fetching top scorers' });
            return;
        }
        res.json({ topScorers: results });
    });
});

// GET team win-loss ratios
app.get('/api/analytics/team-ratios', (req, res) => {
    const minWinRatio = req.query.minRatio || 0;
    const query = `
        SELECT 
            team_ID as id,
            team_name as name,
            wins,
            losses,
            ROUND(record, 3) as ratio
        FROM Team
        WHERE record >= ?
        ORDER BY record DESC
        LIMIT 5
    `;

    connection.query(query, [minWinRatio], (err, results) => {
        if (err) {
            console.error('Error fetching team ratios:', err);
            res.status(500).json({ error: 'Error fetching team ratios' });
            return;
        }
        res.json({ teamRatios: results });
    });
});

// GET highest scoring teams
app.get('/api/analytics/highest-scoring', (req, res) => {
    const minGames = parseInt(req.query.minGames) || 0;
    console.log('Fetching highest scoring teams with minGames:', minGames);
    
    const query = `
        SELECT 
            t.team_ID as id,
            t.team_name as name,
            SUM(CASE 
                WHEN g.home_team_ID = t.team_ID THEN g.home_team_score
                WHEN g.away_team_ID = t.team_ID THEN g.away_team_score
                ELSE 0
            END) as totalScore,
            COUNT(DISTINCT g.match_ID) as gamesPlayed
        FROM Team t
        LEFT JOIN Game g ON t.team_ID IN (g.home_team_ID, g.away_team_ID)
        GROUP BY t.team_ID, t.team_name
        HAVING COUNT(DISTINCT g.match_ID) >= ?
        ORDER BY totalScore DESC
        LIMIT 5
    `;

    connection.query(query, [minGames], (err, results) => {
        if (err) {
            console.error('Error fetching highest scoring teams:', err);
            res.status(500).json({ error: 'Error fetching highest scoring teams' });
            return;
        }
        console.log('Highest scoring teams results:', results);
        res.json({ highestScoringTeams: results });
    });
});

// GET award winners
app.get('/api/analytics/award-winners', (req, res) => {
    const awardType = req.query.type;
    let query = `
        SELECT 
            CONCAT(aa.athlete_ID, '_', aa.award_ID) as id,
            a.player_name as name,
            aw.award_name as award,
            YEAR(aw.award_date) as year
        FROM Athlete_Award aa
        JOIN Athlete a ON aa.athlete_ID = a.player_ID
        JOIN Award aw ON aa.award_ID = aw.award_ID
    `;
    
    const params = [];
    if (awardType) {
        query += ` WHERE aw.award_name = ?`;
        params.push(awardType);
    }
    
    query += ` ORDER BY aw.award_date DESC LIMIT 5`;

    connection.query(query, params, (err, results) => {
        if (err) {
            console.error('Error fetching award winners:', err);
            res.status(500).json({ error: 'Error fetching award winners' });
            return;
        }
        res.json({ awardWinners: results });
    });
});

// GET injured players
app.get('/api/analytics/injured-players', (req, res) => {
    const minDays = parseInt(req.query.minDays) || 0;
    console.log('Fetching injured players with minDays:', minDays);
    
    const query = `
        SELECT 
            i.injury_ID as id,
            a.player_name as name,
            i.injury_type as injury,
            i.injury_date,
            i.total_days_injured as daysOut,
            i.status
        FROM Injury i
        JOIN Athlete a ON i.player_ID = a.player_ID
        WHERE i.total_days_injured >= ?
        ORDER BY i.total_days_injured DESC
        LIMIT 5
    `;

    connection.query(query, [minDays], (err, results) => {
        if (err) {
            console.error('Error fetching injured players:', err);
            res.status(500).json({ error: 'Error fetching injured players' });
            return;
        }
        console.log('Injured players results:', results);
        res.json({ injuredPlayers: results });
    });
});

// GET team scoring averages
app.get('/api/analytics/team-averages', (req, res) => {
    const minPoints = req.query.minPoints || 0;
    const query = `
        SELECT 
            t.team_ID as id,
            t.team_name as team,
            ROUND(AVG(CASE 
                WHEN g.home_team_ID = t.team_ID THEN g.home_team_score
                ELSE g.away_team_score
            END), 1) as avgPoints
        FROM Team t
        JOIN Game g ON t.team_ID IN (g.home_team_ID, g.away_team_ID)
        GROUP BY t.team_ID
        HAVING avgPoints >= ?
        ORDER BY avgPoints DESC
        LIMIT 5
    `;

    connection.query(query, [minPoints], (err, results) => {
        if (err) {
            console.error('Error fetching team averages:', err);
            res.status(500).json({ error: 'Error fetching team averages' });
            return;
        }
        res.json({ teamAverages: results });
    });
});

// POST new team
app.post('/api/teams', (req, res) => {
    const {
        team_name, league, wins, losses, standing, location
    } = req.body;

    // Calculate record based on wins and losses
    const record = wins && losses ? wins / (wins + losses) : 0;

    const query = `
        INSERT INTO Team (
            team_name, league, wins, losses,
            record, standing, location
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    connection.query(query, [
        team_name, league, wins, losses,
        record, standing, location
    ], (err, results) => {
        if (err) {
            console.error('Error creating team:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(400).json({ message: 'A team with this name already exists' });
            } else {
                res.status(500).json({ message: 'Error creating team: ' + err.message });
            }
            return;
        }
        
        // After inserting, fetch and return the created team
        const selectQuery = 'SELECT * FROM Team WHERE team_ID = ?';
        connection.query(selectQuery, [results.insertId], (err, selectResults) => {
            if (err) {
                console.error('Error fetching created team:', err);
                res.status(201).json({ 
                    id: results.insertId, 
                    message: 'Team created successfully, but unable to fetch details' 
                });
                return;
            }
            res.status(201).json({ 
                message: 'Team created successfully',
                team: selectResults[0]
            });
        });
    });
});

// GET all athlete awards
app.get('/api/athlete-awards', (req, res) => {
    const query = `
        SELECT aa.*, a.player_name, aw.award_name, aw.award_date
        FROM Athlete_Award aa
        JOIN Athlete a ON aa.athlete_ID = a.player_ID
        JOIN Award aw ON aa.award_ID = aw.award_ID
        ORDER BY aw.award_date DESC
    `;
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching athlete awards:', err);
            res.status(500).json({ message: 'Error fetching athlete awards' });
            return;
        }
        res.json({ athleteAwards: results });
    });
});

// GET all team awards
app.get('/api/team-awards', (req, res) => {
    const query = `
        SELECT ta.*, t.team_name, aw.award_name, aw.award_date
        FROM Team_Award ta
        JOIN Team t ON ta.team_ID = t.team_ID
        JOIN Award aw ON ta.award_ID = aw.award_ID
        ORDER BY aw.award_date DESC
    `;
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching team awards:', err);
            res.status(500).json({ message: 'Error fetching team awards' });
            return;
        }
        res.json({ teamAwards: results });
    });
});

// GET all statistics
app.get('/api/statistics', (req, res) => {
  const query = `
    SELECT s.*, a.player_name, g.date as game_date
    FROM Statistic s
    JOIN Athlete a ON s.player_ID = a.player_ID
    JOIN Game g ON s.match_ID = g.match_ID
    ORDER BY g.date DESC, a.player_name
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching statistics:', err);
      res.status(500).json({ message: 'Error fetching statistics' });
      return;
    }
    res.json(results);
  });
});

// Add this new route for injuries
app.post('/api/injuries', (req, res) => {
    const { player_ID, injury_type, injury_date, recovery_date } = req.body;
    const query = `
        INSERT INTO Injury (player_ID, injury_type, injury_date, recovery_date)
        VALUES (?, ?, ?, ?)
    `;
    
    connection.query(query, [player_ID, injury_type, injury_date, recovery_date], (err, results) => {
        if (err) {
            console.error('Error creating injury record:', err);
            res.status(500).json({ error: 'Error creating injury record' });
            return;
        }
        res.status(201).json({ id: results.insertId, message: 'Injury record created successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
