package doodlejump;

import javafx.geometry.Bounds;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Rectangle;

/**
 * This is our platform class. This class handles mechanics with all types of platforms. We declare platformType,
 * direction, centralVertical, velocity, basePlatform, and playerPane. We use a switch statement so that we can
 * vary the properties of the platforms based on its type.
 */
public class Platform {
    private final Rectangle basePlatform;
    private final Pane playerPane;
    private int platformType;
    private boolean direction;
    private double centralVertical;
    private double velocity;

    public Platform(Pane pane) { // we associate playerPane so we can add children (basePlatform)
        this.basePlatform = new Rectangle(Constants.PLATFORM_WIDTH, Constants.PLATFORM_HEIGHT);
        this.platformType = this.getRandomType();

        this.playerPane = pane;
        this.setupPlatform();
        this.playerPane.getChildren().addAll(basePlatform);
    }

    /**
     * This helper method sets the x and y location of each different platform. Here we create different
     * variations of the base platform, which have different functions. We use assigned values (1,2, etc..) so that the
     * randomizer can understand the platforms functions in correspondence with the likelihood of them appearing
     * on root.
     */
    public void setupPlatform(){
        this.setPos(Constants.ROOT_CENTER_X, Constants.ROOT_CENTER_Y);
        switch(this.platformType) {
            case (Constants.VAR_NORMAL_PLATFORM):
                this.basePlatform.setFill(Color.GREEN);
                this.basePlatform.setStroke(Color.BLACK);
                break;
            case (Constants.VAR_BOUNCY_PLATFORM):
                this.basePlatform.setFill(Color.HOTPINK);
                this.basePlatform.setStroke(Color.BLACK);
                break;
            case (Constants.VAR_MOVING_X_PLATFORM):
                this.basePlatform.setFill(Color.LIGHTBLUE);
                this.basePlatform.setStroke(Color.BLACK);
                this.direction = true;
                break;
            case (Constants.VAR_DIS_PLATFORM):
                this.basePlatform.setFill(Color.FIREBRICK);
                this.basePlatform.setStroke(Color.BLACK);
                this.velocity = 0;
                break;
            case (Constants.VAR_MOVING_Y_PLATFORM):
                this.basePlatform.setFill(Color.DARKBLUE);
                this.basePlatform.setStroke(Color.BLACK);
                this.direction = true;
                break;
            case (Constants.VAR_BOUNCE_DISAPPEAR_PLATFORM):
                this.basePlatform.setFill(Color.WHITE);
                this.basePlatform.setStroke(Color.BLACK);
                this.velocity = 0;
                break;
            default:
                break;
        }
    }

    /**
     * This mutator method sets the dimensions of the base platform.
     */
    public void setPos(double x, double y){
        this.basePlatform.setX(x - Constants.PLATFORM_WIDTH / 2);
        this.basePlatform.setY(y - Constants.PLATFORM_HEIGHT / 2);
    }

    /**
     * This accessor method returns the x-location of the base platform.
     */
    public double getCenterX(){

        return this.basePlatform.getX() + Constants.PLATFORM_WIDTH / 2;
    }

    public double getCenterY(){
        return this.basePlatform.getY() + Constants.PLATFORM_HEIGHT / 2;
    }

    /**
     * This accessor method returns the y-location of the base platform.
     */
    public void movePlatform(double x, double y) {
        this.setPos(this.getCenterX() + x, this.getCenterY() + y);
    }


    /**
     * This accessor method returns a random type, so that the platforms can be generated with respective probabilities.
     * Probabilities were made so that normal platforms are more apparent than special, moving-x platforms e.g.
     */
    private int getRandomType(){
        int random = (int)(Math.random() * Constants.PROBABILITY_CONSTANT);
        if (random < Constants.PROBABILITY_NORMAL_PLATFORM){
            return Constants.VAR_NORMAL_PLATFORM;
        } else if (random < Constants.PROBABILITY_BOUNCY_PLATFORM){
            return Constants.VAR_BOUNCY_PLATFORM;
        } else if (random < Constants.PROBABILITY_DISAPPEARING_PLATFORM){
            return Constants.VAR_DIS_PLATFORM;
        } else if (random < Constants.PROBABILITY_MOVING_X_PLATFORM){
            return Constants.VAR_MOVING_X_PLATFORM;
        } else if (random < Constants.PROBABILITY_MOVING_Y_PLATFORM){
            return Constants.VAR_MOVING_Y_PLATFORM;
        } else {
            return Constants.VAR_BOUNCE_DISAPPEAR_PLATFORM;
        }
    }

    public int getPlatformType(){
        return this.platformType;
    }

    public boolean getDirection(){
        return this.direction;
    }

    /**
     * This mutator method creates a boolean variable so that we can call it in DoodleJump when assigning direction.
     */
    public void setDirection(boolean myBoolean){ // has to be boolean due to its binary variation in direction.
        this.direction = myBoolean;
    }

    public void setPlatformType(int myPlatformType){
        this.platformType = myPlatformType;
    }

    public double getCentralVertical(){
        return centralVertical;
    }

    public void setCentralVertical(double verticalPosition){
        this.centralVertical = verticalPosition;
    }

    public void setVelocity(double initialVelocity){
        this.velocity = initialVelocity;
    }

    public double getVelocity(){
        return this.velocity;
    }

    public void setFillColor(Color color){
        this.basePlatform.setFill(color);
    }

    public Bounds getBoundsInParent(){
        return this.basePlatform.getBoundsInParent(); // get method that returns bounds of the platform
    }
}


