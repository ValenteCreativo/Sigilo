"use client";

import { useState, useCallback } from "react";
import { CalculatorProps } from "@/types";

const UNLOCK_SEQUENCE = ["+", "=", "="];
const EMERGENCY_SEQUENCE = ["9", "1", "1", "="];

export function Calculator({ onUnlockAttempt, onEmergency }: CalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [buttonSequence, setButtonSequence] = useState<string[]>([]);

  const checkUnlockSequence = useCallback(
    (newSequence: string[]) => {
      // Check for emergency sequence (911=)
      const lastFour = newSequence.slice(-4);
      if (
        lastFour.length === 4 &&
        lastFour[0] === EMERGENCY_SEQUENCE[0] &&
        lastFour[1] === EMERGENCY_SEQUENCE[1] &&
        lastFour[2] === EMERGENCY_SEQUENCE[2] &&
        lastFour[3] === EMERGENCY_SEQUENCE[3]
      ) {
        onEmergency?.();
        setButtonSequence([]);
        return;
      }

      // Check for unlock sequence (+=+)
      const lastThree = newSequence.slice(-3);
      if (
        lastThree.length === 3 &&
        lastThree[0] === UNLOCK_SEQUENCE[0] &&
        lastThree[1] === UNLOCK_SEQUENCE[1] &&
        lastThree[2] === UNLOCK_SEQUENCE[2]
      ) {
        onUnlockAttempt();
        setButtonSequence([]);
      }
    },
    [onUnlockAttempt, onEmergency]
  );

  const handleButtonPress = useCallback(
    (label: string) => {
      const newSequence = [...buttonSequence, label];
      setButtonSequence(newSequence);
      checkUnlockSequence(newSequence);
    },
    [buttonSequence, checkUnlockSequence]
  );

  const inputDigit = (digit: string) => {
    handleButtonPress(digit);
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    handleButtonPress(".");
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const clear = () => {
    handleButtonPress("C");
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperator: string) => {
    handleButtonPress(nextOperator);
    const inputValue = parseFloat(display);

    if (nextOperator === "=") {
      if (operator && previousValue !== null) {
        let result = previousValue;
        switch (operator) {
          case "+":
            result = previousValue + inputValue;
            break;
          case "-":
            result = previousValue - inputValue;
            break;
          case "*":
            result = previousValue * inputValue;
            break;
          case "/":
            result = inputValue !== 0 ? previousValue / inputValue : 0;
            break;
        }
        setDisplay(String(result));
        setPreviousValue(null);
        setOperator(null);
      }
      setWaitingForOperand(true);
      return;
    }

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      let result = previousValue;
      switch (operator) {
        case "+":
          result = previousValue + inputValue;
          break;
        case "-":
          result = previousValue - inputValue;
          break;
        case "*":
          result = previousValue * inputValue;
          break;
        case "/":
          result = inputValue !== 0 ? previousValue / inputValue : 0;
          break;
      }
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const buttons = [
    ["C", "", "", "/"],
    ["7", "8", "9", "*"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "=", ""],
  ];

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* Display */}
      <div className="bg-sigilo-surface rounded-t-2xl p-4 mb-1">
        <div className="text-right text-4xl font-light text-sigilo-text-primary truncate">
          {display}
        </div>
      </div>

      {/* Button Grid */}
      <div className="bg-sigilo-card rounded-b-2xl p-3 grid grid-cols-4 gap-2">
        {buttons.flat().map((btn, index) => {
          if (btn === "") return <div key={index} />;

          const isOperator = ["+", "-", "*", "/", "="].includes(btn);
          const isClear = btn === "C";
          const isZero = btn === "0";

          return (
            <button
              key={index}
              onClick={() => {
                if (isClear) {
                  clear();
                } else if (isOperator) {
                  performOperation(btn);
                } else if (btn === ".") {
                  inputDecimal();
                } else {
                  inputDigit(btn);
                }
              }}
              className={`
                ${isZero ? "col-span-1" : ""}
                h-14 rounded-xl font-medium text-xl
                transition-all duration-150
                active:scale-95
                ${
                  isOperator
                    ? "bg-sigilo-teal/20 text-sigilo-teal hover:bg-sigilo-teal/30"
                    : isClear
                    ? "bg-sigilo-red/10 text-sigilo-red hover:bg-sigilo-red/20"
                    : "bg-sigilo-border/30 text-sigilo-text-primary hover:bg-sigilo-border/50"
                }
              `}
            >
              {btn}
            </button>
          );
        })}
      </div>

      {/* Version hint only - no emergency disclosure */}
      <p className="mt-4 text-center text-[10px] text-sigilo-text-muted/30 select-none">
        Calculator v1.0
      </p>
    </div>
  );
}
