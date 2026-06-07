package doodlejump;

import javafx.animation.Animation;
import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.event.ActionEvent;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.effect.BlurType;
import javafx.scene.effect.DropShadow;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.util.Duration;
import java.util.ArrayList;

/**
 * This is our DoodleJump top-level logic class. In the constructor, we associated respective instances, we assigned
 * high score to 0 so that the initial high score is 0, meaning it resets for every new execution of the program.
 * Instantiated all variables, and we called setUpGame so that the game can run both graphically and logically. Our
 * logic class handles the timeline, the key input, the scrolling, intersection, platform spawning and moving, scores,
 * and finally game ending/restarting.
 *
 */
public class DoodleJump {
    private final Pane playerPane;
    private Doodle player;
    private ArrayList<Platform> platforms;
    private Platform topPlatform;
    private Timeline myTimeline;
    private double score;
    private final Label scoreLabel;
    private final Label highScoreLabel;
    private int highScore;
    private Button restartButton;
    private final HBox buttonPane;

    public DoodleJump(Pane pane, Label scoreLabel, HBox buttonPane, Label highScore) {
        // associated playerPane, scoreLabel, buttonPane, and hiScore with DoodleJump so that DoodleJump
        // access the instances.

        this.highScore = 0;
        this.highScoreLabel = highScore;
        this.scoreLabel = scoreLabel; // instance because it needs to be called in other methods
        this.playerPane = pane;
        this.buttonPane = buttonPane;

        this.setupGame();
    }

    /**
     * This is a helper method that handles the launching of the DoodleJump game. We spawn the platforms, set the
     * base score and call the timeline.
     */
    private void setupGame(){
        this.score = 0;
        this.playerPane.setOnKeyPressed((KeyEvent e) -> keyPress(e)); // lambda statement: KeyEvent handles KeyPressed
        this.playerPane.setFocusTraversable(true); // passed in true so that switch statement is executed
        this.playerPane.requestFocus();

        this.platforms = new ArrayList<>(); // we create an arraylist to store all variations of the platforms
        this.spawnStartingPlatform(); // adds initial platform to arraylist
        this.player = new Doodle(playerPane);

        this.scoreLabel.setText("Score: 0");
        this.setUpTimeline();
    }

    /**
     * This is the switch statement that CREATES the relation between a key press and movement methods from the Doodle
     * class. Called the method getCode() on the KeyEvent which will report the keyboard key (KeyCode) that has
     * been pressed.
     *
     * @param e
     */
    private void keyPress(KeyEvent e) {
        KeyCode pressed = e.getCode(); //gets key input
        switch (pressed) {
            case LEFT:
            case A: // if pressed, doodle moves left by constant
                this.player.moveDoodle(-Constants.MAINBODY_OFFSET, 0);
                break;
            case RIGHT:
            case D: // if pressed, doodle moves right by constant
                this.player.moveDoodle(Constants.MAINBODY_OFFSET, 0);
                break;
            default: // any other key pressed, nothing will happen logically or graphically
                break;
        }
        e.consume();
    }

    /**
     * This updateTimeline actually allows for the doodle to wrap around in the root BorderPane, so
     * that the game feels more realistic. We do so by creating if statements, which, in pseudocode, say that
     * doodle should move position back to the other side everytime it hits the boundary of the root width.
     * Additionally, we set the doodle's velocity and update it's y-position.
     *
     * We also check intersection with each of the platforms, and have each platform respond appropriately depending
     * on platform type. We update scrolling, platform spawning, and checks whether the game is over.
     */
    private void updateTimeline() {

        double gameScore = this.score; // score is double as it increments with decimals.
        int gameScoreInt = (int)gameScore; // displays score in integers, not decimals.

        if (this.score > this.highScore){
            this.highScore = gameScoreInt; // update the high score with your new, current score.
        }

        this.scoreLabel.setText("Score: " + gameScoreInt);

        if (this.player.getCenterX() > Constants.ROOT_WIDTH + Constants.DOODLE_WIDTH / 2) { // wrapping capability right.
            this.player.moveDoodle(-Constants.ROOT_WIDTH, 0); // must be center value, so divide by 2.
        }

        if (this.player.getCenterX() < 0 - Constants.DOODLE_WIDTH / 2) { // wrapping capability right.
            this.player.moveDoodle(Constants.ROOT_WIDTH, 0);
        }

        this.player.setVelocity(this.player.getVelocityY() + Constants.GRAVITY / Constants.REFRESH_RATE);
        //updating faller rate to gravity
        this.player.updateY(Constants.REFRESH_RATE); // sets new y position.
        for (Platform plat : this.platforms) { // "for-each" platform in array, so we can go through each.
            if (plat.getPlatformType() == Constants.VAR_MOVING_X_PLATFORM) { // gets type if it's moving in horizontal.
                if (plat.getDirection()) { // checks if it's moving right.
                    if (plat.getCenterX() < Constants.ROOT_WIDTH - Constants.PLATFORM_WIDTH / 2) {
                        // if it hasn't reached the root end
                        plat.movePlatform(Constants.PLATFORM_MOVE_X_OFFSET, 0); // then continue moving right.
                    }
                    else {
                        plat.movePlatform(-Constants.PLATFORM_MOVE_X_OFFSET, 0); // other-wise start moving left.
                        plat.setDirection(false); // changes the set direction of the instance to opposite.
                    }
                }
                else { // if the direction is left, so not right
                    if (plat.getCenterX() > Constants.PLATFORM_WIDTH / 2) {
                        plat.movePlatform(-Constants.PLATFORM_MOVE_X_OFFSET, 0);
                    }
                    else {
                        plat.movePlatform(Constants.PLATFORM_MOVE_X_OFFSET, 0);
                        plat.setDirection(true);
                    }
                }
            }
            else if (plat.getPlatformType() == Constants.VAR_MOVING_Y_PLATFORM) { //
                if (plat.getDirection()) { // if it's moving down
                    if (plat.getCenterY() - plat.getCentralVertical() < Constants.MAX_MOVING_PLATFORM_Y_OFFSET) {
                        plat.movePlatform(0, Constants.PLATFORM_MOVE_Y_OFFSET);
                        // if center of platform offset is less than max offset, then move it down.
                    }
                    else {
                        plat.movePlatform(0, -Constants.PLATFORM_MOVE_Y_OFFSET); // other-wise change direction.
                        plat.setDirection(false);
                    }
                }
                else { // if it's moving the other way
                    if (plat.getCenterY() - plat.getCentralVertical() > -Constants.MAX_MOVING_PLATFORM_Y_OFFSET) {
                        plat.movePlatform(0, -Constants.PLATFORM_MOVE_Y_OFFSET);
                        // if the platform offset is less than max offset, then move it up.
                    }
                    else {
                        plat.movePlatform(0, Constants.PLATFORM_MOVE_Y_OFFSET); // changes direction at max offset.
                        plat.setDirection(true);
                    }
                }
            } else if (plat.getPlatformType() == Constants.VAR_DIS_PLATFORM ||
                            plat.getPlatformType() == Constants.VAR_BOUNCE_DISAPPEAR_PLATFORM){
                // if the platform type is a bounce OR a disappearing platform.
                plat.movePlatform(0, plat.getVelocity() / Constants.REFRESH_RATE);
                // platform should move by 0 and y-velocity, so that updates the position.
            }
        }
        if (this.platforms != null) { // if the arraylist is not empty
            for (Platform platform : this.platforms) { // for-each platform
                if (this.player.collisionDetection(platform)) { // if player detects collision with platform
                    switch(platform.getPlatformType()){
                        case(Constants.VAR_BOUNCY_PLATFORM): // assigns bouncy rebound velocity to bouncy platform.
                            this.player.setVelocity(Constants.BOUNCY_REBOUND_VELOCITY);
                            break;
                        case(Constants.VAR_DIS_PLATFORM): // assigns negative rebound velocity so platform travels down.
                            platform.setVelocity(-Constants.REBOUND_VELOCITY);
                            break;
                        case(Constants.VAR_BOUNCE_DISAPPEAR_PLATFORM):
                            platform.setVelocity(-Constants.REBOUND_VELOCITY);
                            // assigns negative rebound velocity so platform travels down.
                            platform.setFillColor(Color.FIREBRICK); // turn red visually
                            this.player.setVelocity(Constants.REBOUND_VELOCITY); // so the player bounces
                            break;
                        case(Constants.VAR_MOVING_Y_PLATFORM):
                            if(platform.getDirection()){ // if it's moving up, give it bigger bounce.
                                this.player.setVelocity(Constants.REBOUND_VELOCITY + Constants.REFRESH_RATE);
                            }
                            else { // if it's moving down, give it bigger bounce.
                                this.player.setVelocity(Constants.REBOUND_VELOCITY - Constants.REFRESH_RATE);
                            }
                            break;
                        default:
                            this.player.setVelocity(Constants.REBOUND_VELOCITY); // any other platform, rebound normal.
                            break;
                    }
                    this.player.snapToPlatformTop(platform);
                    break;
                }
            }
        }
        this.spawnPlatforms(); // call each method so that timeline is "updated".
        this.scrollRoot();
        this.checkGameOver();
    }

    /**
     * The setUpTimeline method is created with root as a parameter so that the doodle can be
     * animated. This is where we instantiate a new Timeline with a KeyFrame passed in that updates the Timeline
     * every half-second. We set the duration of the KeyFrame to 20 milliseconds, so the game feels smooth.
     */
    private void setUpTimeline() {
        if (this.myTimeline != null) {
            this.myTimeline.stop();
        }
        KeyFrame myKeyframe = new KeyFrame(Duration.seconds(Constants.DURATION),
                (ActionEvent e) -> this.updateTimeline()); // ActionEvent returns updated timeline
        this.myTimeline = new Timeline(myKeyframe);
        this.myTimeline.setCycleCount(Animation.INDEFINITE); // make program run forever
        this.myTimeline.play(); // starts timeline
    }

    /**
     * The spawnStartingPlatform method adds a new platform and sets the position of the base platform, so that
     * the player doesn't fall off the platform right away.
     */
    private void spawnStartingPlatform() {
        this.platforms.add(new Platform(this.playerPane));
        this.platforms.get(0).setPlatformType(Constants.VAR_NORMAL_PLATFORM); // first normal, base platform
        this.platforms.get(0).setupPlatform(); // sets color, but we want a different color for base instead of green.
        this.platforms.get(0).setFillColor(Color.SLATEGRAY);
        this.platforms.get(0).setPos(Constants.PLATFORM_START_X, Constants.PLATFORM_START_Y);
    }

    /**
     * This method ensures the entire playerPane is filled with platforms. This way, all jumps with the doodle
     * will be possible given the offset values. We use a while loop to execute the code within until the topPlatform
     * is off the playerPane. While loop will add platforms when scrolling occurs; checks if screen is full, and if not,
     * then adds more
     */
    private void spawnPlatforms() {
        this.topPlatform = this.platforms.get(this.platforms.size() - 1);   // saves top platform on screen;
        // indexing -1 so that we get the last platform in the arraylist: avoiding out-of-bounds.
        while (topPlatform.getCenterY() > 0) { // repeat while the top platform is on screen.

            double low = Math.max(0, topPlatform.getCenterX() - Constants.MAX_PLATFORM_X_OFFSET); //Sets minimum x position
            // for the next platform that spawns.
            double high = Math.min(Constants.ROOT_WIDTH - Constants.PLATFORM_WIDTH,
                    topPlatform.getCenterX() + Constants.MAX_PLATFORM_X_OFFSET); // Sets maximum x position for next
            //platform that spawns.
            double horizontalCoordinate = low + Math.random() * (high - low); // randomizes the next platform's x-position

            low = topPlatform.getCenterY() - Constants.MINIMUM_PLAYFORM_Y_OFFSET; // sets minimum y position for
            // the next platform.
            high = topPlatform.getCenterY() - Constants.MAX_PLATFORM_Y_OFFSET; // sets maximum y position for
            // the next platform.
            double verticalCoordinate = (low + Math.random() * (high - low)); // randomizes the next
            // platform's y-position.

            this.platforms.add(new Platform(this.playerPane)); // adds a new platform.
            this.platforms.get(this.platforms.size() - 1).setPos(horizontalCoordinate, verticalCoordinate);
            //sets the position of the new platform to the ones randomized above.
            if (this.platforms.get(this.platforms.size() - 1).getPlatformType() == Constants.VAR_MOVING_Y_PLATFORM) {
                //if it's a dark blue platform.
                this.platforms.get(this.platforms.size() - 1).setCentralVertical(
                        //set center of oscillation to initial position.
                        this.platforms.get(this.platforms.size() - 1).getCenterY());
            }

            if (topPlatform.getPlatformType() == Constants.VAR_DIS_PLATFORM
                    && this.platforms.size() >= 3) { //if the top platform
                // was a disappearing one.
                low = this.platforms.get(this.platforms.size() - 3).getCenterY()
                        - Constants.MINIMUM_PLAYFORM_Y_OFFSET;
                high = this.platforms.get(this.platforms.size() - 3).getCenterY()
                        - Constants.MAX_PLATFORM_Y_OFFSET;
                verticalCoordinate = (low + (high - low)); //adjust the y-coordinate for the new platform .
                // so that the jump is possible.
                this.platforms.get(this.platforms.size() - 1).setPos
                        (this.platforms.get(this.platforms.size() - 1).getCenterX(), verticalCoordinate); //apply the
                // new y coordinate to the platform.
                this.platforms.get(this.platforms.size() - 1).setPlatformType(1); // set the platform type to standard
                this.platforms.get(this.platforms.size() - 1).setFillColor(Color.GREEN); // reset its styling
                if (this.platforms.get(this.platforms.size() - 1).getCenterY() - topPlatform.getCenterY()
                    < Constants.MINIMUM_PLAYFORM_Y_OFFSET){ // if the platforms are too close
                    this.platforms.get(this.platforms.size() - 1).movePlatform(0,
                    Constants.CORRECTION_PLATFORM_OFFSET);  // shifted down so
                                                            // platforms don't spawn on top of each other.
                }
            }
            this.topPlatform = this.platforms.get(this.platforms.size() - 1); //re-saves the new.
            // top platform to topPlatform.
        }
    }

    /**
     * The scrollRoot method uses an if statement, a for-each loop, and a while loop to handle the scrolling ability of
     * the game. If the doodle's y location is less than half the height of the pane, we run a for-each loop to be able
     * to run through each platform, and the player/doodle, in order to set there respective positions.
     */
    private void scrollRoot() {
        if (this.player.getCenterY() < Constants.ROOT_HEIGHT / 2) { //if the player is above the middle.
            double difference = (Constants.ROOT_HEIGHT / 2) - this.player.getCenterY(); //sets the y difference.
            //between the player and the middle of the screen i.e. the amount to scroll by.
            this.score += Constants.SCORE_INCREMENT; //increments the score by 0.1.
            for (Platform plat : platforms) { //for each platform.
                plat.setPos(plat.getCenterX(), plat.getCenterY() + difference); //move it down by the scroll amount.
                if (plat.getPlatformType() == Constants.VAR_MOVING_Y_PLATFORM) {
                    // if the platform is a y-moving platform.
                    plat.setCentralVertical(plat.getCentralVertical() + difference);//adjust the central point
                    //of oscillation.
                }
            }
            this.player.setPos(this.player.getCenterX(), this.player.getCenterY() + difference); //move the player
            // by the scroll amount.
        }
        int count = 0;
        while (count <= this.platforms.size() - 1) { // iterates when the platform y location is goes below the root.
            if (this.platforms.get(count).getCenterY() > Constants.ROOT_HEIGHT) {
                //if the platform is out of the screen, remove it graphically and logically.
                this.playerPane.getChildren().remove(this.platforms.get(count));
                this.platforms.remove(count);
                count--; // reset the counting index.
            }
            count++; // increments count by 1 to continue iteration, so that scrolling continues.
        }
    }

    /**
     * This method clears the playerPane, so that the game can be recalled for a new round of DoodleJump!
     */
    private void restart(){
        this.playerPane.getChildren().clear();
        this.setupGame();
        this.buttonPane.getChildren().removeAll(this.highScoreLabel, this.restartButton);
    }

    /**
     * This method creates a new restart button that takes a mouse input.
     */
    private void setupRestartButton(){
        this.restartButton = new Button("Restart");
        this.buttonPane.getChildren().add(this.restartButton);
        this.restartButton.setOnAction((ActionEvent e) -> this.restart());
        this.restartButton.setFocusTraversable(false);
    }

    /**
     * This is the method that handles the game over text. First, we have to stop the timeline so that the platforms
     * stops moving. We use an array of two colors, purple and white, so that the for loop can execute a shadow light
     * effect from PURPLE (VAR1) TO WHITE (VAR2). Also, we call the high score label in gameOver, as this score
     * will only display once a player has fallen off the root pane.
     */
    private void gameOver() {
        this.myTimeline.stop(); // stops the timeline.
        Label label = new Label("Game Over!");
        VBox labelBox = new VBox(label);
        labelBox.setAlignment(Pos.CENTER);
        labelBox.setPrefHeight(this.playerPane.getHeight());
        labelBox.setPrefWidth(this.playerPane.getWidth());
        label.setStyle("-fx-font: italic bold 60px verdana, serif;-fx-text-alignment: center;-fx-text-fill: #7b3131;");
        Color[] colors = new Color[]{Constants.GAME_OVER_COLOR1, Constants.GAME_OVER_COLOR2};
        DropShadow shadow = new DropShadow(BlurType.GAUSSIAN, Constants.GAME_OVER_SHADOW_COLOR,
                Constants.GAME_OVER_SHADOW_RADIUS, Constants.GAME_OVER_SHADOW_SPREAD,
                Constants.GAME_OVER_SHADOW_OFFSET_X, Constants.GAME_OVER_SHADOW_OFFSET_Y);
        Color[] myColors = colors;
        int var1 = colors.length;

        for (int var2 = 0; var2 < var1; ++var2) { // for loop that adds DropShadow of color white to color purple.
            Color color = myColors[var2];
            DropShadow temp = new DropShadow(BlurType.GAUSSIAN, color,
                    Constants.GAME_OVER_SHADOW_RADIUS, Constants.GAME_OVER_SHADOW_SPREAD,
                    Constants.GAME_OVER_SHADOW_OFFSET_X, Constants.GAME_OVER_SHADOW_OFFSET_Y);
            temp.setInput(shadow);
            shadow = temp;
        }
        label.setEffect(shadow);
        this.playerPane.getChildren().addAll(labelBox);
        this.buttonPane.getChildren().add(this.highScoreLabel);

        if ((int)this.score == this.highScore){
            this.highScoreLabel.setText("New High Score!");
        }
        else { // if the score does not equal the highest possible score, then a new score will be added as text.
            this.highScoreLabel.setText("High Score: " + highScore);
        }
        this.playerPane.setOnKeyPressed(null); // now there is no key input executed.

        this.setupRestartButton();
    }

    /**
     * This helper method handles ending the game with gameOver() if the y location of the doodle is less than
     * height of the window.
     */
    private void checkGameOver() {
        if (this.player.getCenterY() > Constants.ROOT_HEIGHT) {
            this.gameOver();
        }
    }
}