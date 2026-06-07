package doodlejump;

import javafx.scene.paint.Color;

/**
 * Here is our constants class. We declare each of our constants with their respective types.
 */
public class Constants {

    public static final int GRAVITY = 1000;
    public static final int REBOUND_VELOCITY = -600;
    public static final int BOUNCY_REBOUND_VELOCITY = -1200;
    public static final double DURATION = 0.016;

    public static final int PLATFORM_WIDTH = 40;
    public static final int PLATFORM_HEIGHT = 10;
    public static final int DOODLE_WIDTH = 20;
    public static final int DOODLE_HEIGHT = 40;
    public static final Color DOODLE_COLOR = Color.web("#FFD700");

    public static final double ROOT_WIDTH = 450;
    public static final double ROOT_HEIGHT = 800;
    public static final double ROOT_CENTER_X = 225;
    public static final double ROOT_CENTER_Y = 400;

    public static final double BUTTON_PANE_WIDTH = 200;
    public static final double BUTTON_PANE_HEIGHT = 40;
    public static final String BUTTON_PANE_COLOR = "-fx-background-color: #32CD32";

    public static final int SCORE_OFFSET = 50;
    public static final double SCORE_INCREMENT = 0.1;

    public static final int MAINBODY_OFFSET = 25;

    public static final double REFRESH_RATE = 62.5;

    public static final int MAX_PLATFORM_X_OFFSET = 175;
    public static final int MAX_PLATFORM_Y_OFFSET = 125;
    public static final int MINIMUM_PLAYFORM_Y_OFFSET = 50;

    public static final int PLATFORM_START_X = 225;
    public static final int PLATFORM_START_Y = 700;

    public static final int DOODLE_START_X = PLATFORM_START_X;
    public static final int DOODLE_START_Y =
            PLATFORM_START_Y - PLATFORM_HEIGHT / 2 - DOODLE_HEIGHT / 2;

    public static final int PLATFORM_MOVE_X_OFFSET = 2;
    public static final int PLATFORM_MOVE_Y_OFFSET = 1;

    public static final int MAX_MOVING_PLATFORM_Y_OFFSET = 20;
    public static final int CORRECTION_PLATFORM_OFFSET = -50;

    public static final int VAR_NORMAL_PLATFORM = 1;
    public static final int VAR_BOUNCY_PLATFORM = 2;
    public static final int VAR_MOVING_X_PLATFORM = 3;
    public static final int VAR_DIS_PLATFORM = 4;
    public static final int VAR_MOVING_Y_PLATFORM = 5;
    public static final int VAR_BOUNCE_DISAPPEAR_PLATFORM = 6;

    public static final int PROBABILITY_CONSTANT = 100;
    public static final int PROBABILITY_NORMAL_PLATFORM = 45;
    public static final int PROBABILITY_BOUNCY_PLATFORM = 50;
    public static final int PROBABILITY_DISAPPEARING_PLATFORM = 68;
    public static final int PROBABILITY_MOVING_X_PLATFORM = 82;
    public static final int PROBABILITY_MOVING_Y_PLATFORM = 90;

    public static final Color GAME_OVER_COLOR1 = Color.web("#CC8899");
    public static final Color GAME_OVER_COLOR2 = Color.web("#FFFFFF");
    public static final Color GAME_OVER_SHADOW_COLOR = Color.web("#E02EF3");

    public static final int GAME_OVER_SHADOW_RADIUS = 0;
    public static final int GAME_OVER_SHADOW_SPREAD = 15;
    public static final int GAME_OVER_SHADOW_OFFSET_X = 3;
    public static final int GAME_OVER_SHADOW_OFFSET_Y = 3;
}
