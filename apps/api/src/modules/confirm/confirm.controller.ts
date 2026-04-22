import { Controller, Patch, Param, Body, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfirmService } from './confirm.service';
import { UpdateExtractedDataDto } from './dto/update-confirm.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, UserContext } from '../auth/decorators/current-user.decorator';

@ApiTags('confirm')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('confirm')
export class ConfirmController {
  constructor(private readonly confirmService: ConfirmService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Confirm or update an extracted data item' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExtractedDataDto,
    @CurrentUser() user: UserContext,
  ) {
    return this.confirmService.update(id, dto, user.userId);
  }
}
