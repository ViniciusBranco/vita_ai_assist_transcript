import logging
from typing import Any, Dict, List, Optional
from uuid import UUID
from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.outputs import LLMResult

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AgentAudit")

class AgentAuditLogger(BaseCallbackHandler):
    """
    Custom Callback Handler for Deep Observability of the Agent's thought process.
    Logs tool usage, inputs, outputs, and final agent decisions.
    """

    def on_tool_start(
        self, serialized: Dict[str, Any], input_str: str, *, run_id: UUID, parent_run_id: Optional[UUID] = None, **kwargs: Any
    ) -> Any:
        """Run when tool starts running."""
        tool_name = serialized.get("name")
        logger.info(f"\n🛠️  [TOOL START] Tool: {tool_name}")
        logger.info(f"📥  [TOOL INPUT] {input_str}")

    def on_tool_end(
        self, output: str, *, run_id: UUID, parent_run_id: Optional[UUID] = None, **kwargs: Any
    ) -> Any:
        """Run when tool ends running."""
        logger.info(f"📤  [TOOL OUTPUT] {output}\n")

    def on_tool_error(
        self, error: BaseException, *, run_id: UUID, parent_run_id: Optional[UUID] = None, **kwargs: Any
    ) -> Any:
        """Run when tool errors."""
        logger.error(f"❌  [TOOL ERROR] {error}\n")

    def on_agent_action(
        self, action: Any, *, run_id: UUID, parent_run_id: Optional[UUID] = None, **kwargs: Any
    ) -> Any:
        """Run on agent action."""
        logger.info(f"🤔  [AGENT THOUGHT] {action.log}")

    def on_agent_finish(
        self, finish: Any, *, run_id: UUID, parent_run_id: Optional[UUID] = None, **kwargs: Any
    ) -> Any:
        """Run on agent end."""
        logger.info(f"🏁  [AGENT FINISH] Return: {finish.return_values}\n")

    def on_llm_start(
        self, serialized: Dict[str, Any], prompts: List[str], *, run_id: UUID, parent_run_id: Optional[UUID] = None, **kwargs: Any
    ) -> Any:
        """Run when LLM starts running."""
        # Optional: Log prompts if needed, but can be verbose
        # logger.info(f"🤖  [LLM START] Prompts: {prompts}")
        pass

    def on_llm_end(
        self, response: LLMResult, *, run_id: UUID, parent_run_id: Optional[UUID] = None, **kwargs: Any
    ) -> Any:
        """Run when LLM ends running."""
        pass
